import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

import { getSession } from "@/lib/session";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "greenfactory",
  waitForConnections: true,
  connectionLimit: 10,
});

type Reading = {
  sensorId: number;
  unitId: number;
  value: number;
};

type Body = {
  machineId: number;
  inputMethod: "QR_SCAN" | "MANUAL";
  measuredAt: string;
  readings: Reading[];
};

type MachineRow = {
  machine_id: number;
  factory_id: number;
  company_id: number;
};

type SensorRow = {
  sensor_id: number;
};

type UnitRow = {
  unit_id: number;
};

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

function isValidReadingValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function parseMeasuredAt(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function POST(request: NextRequest) {
  /*
   * Authentication and authorization must happen before
   * obtaining a database connection.
   */
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 },
    );
  }

  if (session.roleName !== "OPERATOR") {
    return NextResponse.json(
      {
        success: false,
        message: "Operator access required",
      },
      { status: 403 },
    );
  }

  if (
    session.companyId == null ||
    session.factoryId == null
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Operator company or factory is not assigned",
      },
      { status: 403 },
    );
  }

  /*
   * Parse and validate the request before opening a transaction.
   */
  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON body",
      },
      { status: 400 },
    );
  }

  if (!isPositiveInteger(body.machineId)) {
    return NextResponse.json(
      {
        success: false,
        message: "Machine is required",
      },
      { status: 400 },
    );
  }

  if (
    body.inputMethod !== "QR_SCAN" &&
    body.inputMethod !== "MANUAL"
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid input method",
      },
      { status: 400 },
    );
  }

  const measuredAt = parseMeasuredAt(body.measuredAt);

  if (!measuredAt) {
    return NextResponse.json(
      {
        success: false,
        message: "Measured date/time is invalid",
      },
      { status: 400 },
    );
  }

  if (
    !Array.isArray(body.readings) ||
    body.readings.length === 0
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "At least one reading is required",
      },
      { status: 400 },
    );
  }

  for (const reading of body.readings) {
    if (
      !reading ||
      !isPositiveInteger(reading.sensorId) ||
      !isPositiveInteger(reading.unitId) ||
      !isValidReadingValue(reading.value)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reading",
        },
        { status: 400 },
      );
    }
  }

  const connection = await pool.getConnection();

  let transactionStarted = false;

  try {
    /*
     * Server-side tenant isolation.
     *
     * Machine
     *   -> Production Line
     *   -> Department
     *   -> Building
     *   -> Factory
     *   -> Company
     *
     * Both company and factory must match the authenticated
     * operator's session.
     */
    const [machineRows] = await connection.query(
      `
      SELECT
        m.machine_id,
        f.factory_id,
        f.company_id
      FROM machine m
      JOIN production_line pl
        ON pl.line_id = m.line_id
      JOIN department d
        ON d.department_id = pl.department_id
      JOIN building b
        ON b.building_id = d.building_id
      JOIN factory f
        ON f.factory_id = b.factory_id
      WHERE m.machine_id = ?
        AND m.status = 'ACTIVE'
        AND f.factory_id = ?
        AND f.company_id = ?
      LIMIT 1
      `,
      [
        body.machineId,
        session.factoryId,
        session.companyId,
      ],
    );

    const machines = machineRows as MachineRow[];

    if (machines.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Machine is not available for this company and factory",
        },
        { status: 403 },
      );
    }

    /*
     * Validate every sensor and unit before beginning the
     * transaction. This prevents partially-valid requests from
     * reaching the INSERT stage.
     */
    for (const reading of body.readings) {
      const [sensorRows] = await connection.query(
        `
        SELECT sensor_id
        FROM sensor
        WHERE sensor_id = ?
          AND machine_id = ?
          AND status = 'ACTIVE'
        LIMIT 1
        `,
        [
          reading.sensorId,
          body.machineId,
        ],
      );

      if ((sensorRows as SensorRow[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Sensor ${reading.sensorId} is not available for this machine`,
          },
          { status: 400 },
        );
      }

      const [unitRows] = await connection.query(
        `
        SELECT unit_id
        FROM unit
        WHERE unit_id = ?
          AND status = 'ACTIVE'
        LIMIT 1
        `,
        [reading.unitId],
      );

      if ((unitRows as UnitRow[]).length === 0) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Unit ${reading.unitId} is not available`,
          },
          { status: 400 },
        );
      }
    }

    await connection.beginTransaction();
    transactionStarted = true;

    /*
     * sensor_data does NOT contain input_method.
     *
     * inputMethod is still accepted in the request because the
     * existing frontend/API contract distinguishes QR_SCAN from
     * MANUAL, but it must not be inserted into sensor_data unless
     * the database schema intentionally gains such a field later.
     */
    for (const reading of body.readings) {
      await connection.query(
        `
        INSERT INTO sensor_data
        (
          sensor_id,
          unit_id,
          raw_value,
          processed_value,
          quality_status,
          measured_at,
          received_at,
          created_at
        )
        VALUES
        (
          ?,
          ?,
          ?,
          ?,
          'VALID',
          ?,
          NOW(3),
          NOW(3)
        )
        `,
        [
          reading.sensorId,
          reading.unitId,
          reading.value,
          reading.value,
          measuredAt,
        ],
      );
    }

    await connection.commit();
    transactionStarted = false;

    return NextResponse.json({
      success: true,
      message: "Reading saved successfully",
      savedRecords: body.readings.length,
    });
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "ROLLBACK OPERATOR READING ERROR:",
          rollbackError,
        );
      }
    }

    console.error("SAVE OPERATOR READING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save reading",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}