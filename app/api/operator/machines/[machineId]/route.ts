import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "greenfactory",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ machineId: string }> }
) {
  try {
    const { machineId } = await context.params;

    if (!machineId || Number.isNaN(Number(machineId))) {
      return NextResponse.json(
        { message: "Invalid machine id" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
      SELECT
          m.machine_id,
          m.machine_code,
          m.machine_name,

          mt.machine_type_code,
          mt.machine_type_name,

          pl.line_id,
          pl.line_code,
          pl.line_name,

          s.sensor_id,
          s.sensor_code,
          s.sensor_name,

          st.sensor_type_code,
          st.sensor_type_name,

          u.unit_id,
          u.unit_code,
          u.unit_name,
          u.symbol AS unit_symbol

      FROM machine m

      JOIN machine_type mt
          ON mt.machine_type_id = m.machine_type_id

      JOIN production_line pl
          ON pl.line_id = m.line_id

      JOIN department d
          ON d.department_id = pl.department_id

      JOIN building b
          ON b.building_id = d.building_id

      JOIN factory f
          ON f.factory_id = b.factory_id

      JOIN sensor s
          ON s.machine_id = m.machine_id
          AND s.status = 'ACTIVE'

      JOIN sensor_type st
          ON st.sensor_type_id = s.sensor_type_id

      JOIN unit u
          ON u.unit_code =
              CASE st.sensor_type_code
                  WHEN 'POWER_METER'  THEN 'KWH'
                  WHEN 'ENERGY_METER' THEN 'KWH'
                  WHEN 'TEMPERATURE'  THEN 'CELSIUS'
                  WHEN 'PRESSURE'     THEN 'BAR'
                  WHEN 'N2_FLOW'      THEN 'NM3'
                  WHEN 'FLOW_METER'   THEN 'M3'
                  WHEN 'CHEM_FLOW'    THEN 'LITER'
                  WHEN 'CURRENT'      THEN 'AMPERE'
                  WHEN 'VOLTAGE'      THEN 'VOLT'
                  WHEN 'VIBRATION'    THEN 'MM_PER_SEC'
              END

      WHERE m.machine_id = ?
        AND f.factory_id = 3
        AND f.status = 'ACTIVE'
        AND m.status = 'ACTIVE'

      ORDER BY s.sensor_id
      `,
      [machineId]
    );

    const data = rows as any[];

    if (data.length === 0) {
      return NextResponse.json(
        { message: "Machine not found or no active sensors" },
        { status: 404 }
      );
    }

    const machine = {
      machineId: data[0].machine_id,
      machineCode: data[0].machine_code,
      machineName: data[0].machine_name,
      machineTypeCode: data[0].machine_type_code,
      machineTypeName: data[0].machine_type_name,
      lineId: data[0].line_id,
      lineCode: data[0].line_code,
      lineName: data[0].line_name,

      sensors: data.map((row) => ({
        sensorId: row.sensor_id,
        sensorCode: row.sensor_code,
        sensorName: row.sensor_name,
        sensorTypeCode: row.sensor_type_code,
        sensorTypeName: row.sensor_type_name,
        unitId: row.unit_id,
        unitCode: row.unit_code,
        unitName: row.unit_name,
        unitSymbol: row.unit_symbol,
      })),
    };

    return NextResponse.json(machine);
  } catch (error) {
    console.error("GET MACHINE SENSORS ERROR:", error);

    return NextResponse.json(
      { message: "Unable to load machine" },
      { status: 500 }
    );
  }
}