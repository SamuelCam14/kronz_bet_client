// RUTA: client/src/components/QuarterScoresTable.jsx
import React from "react";

// *** CAMBIO: Ya no recibe homeTotal ni visitorTotal ***
function QuarterScoresTable({ periodScores, homeTeamAbbr, visitorTeamAbbr }) {
  // Verifica si hay datos iniciales
  if (!periodScores || periodScores.length === 0) {
    return null;
  }

  // --- *** NUEVO: Filtrar periodos a mostrar *** ---
  // Mostrar siempre Q1-Q4 si existen.
  // Mostrar OTx solo si al menos un equipo anotó en ese periodo.
  const filteredPeriodScores = periodScores.filter((p) => {
    const periodName = p.period_name || "";
    const isQuarter = periodName.startsWith("Q");
    // Considera OT jugado si tiene nombre OT y algún score > 0 (o no es null)
    const isPlayedOvertime =
      periodName.startsWith("OT") &&
      ((p.home_score !== null && p.home_score > 0) ||
        (p.visitor_score !== null && p.visitor_score > 0));

    return isQuarter || isPlayedOvertime;
  });

  // Si después de filtrar no queda nada (extraño, pero posible), no renderizar
  if (filteredPeriodScores.length === 0) {
    return null;
  }
  // --- *** FIN FILTRADO *** ---

  // Genera las cabeceras de los periodos filtrados
  const periodHeaders = filteredPeriodScores.map((p) => p.period_name);

  return (
    <div className="my-4">
      <h5 className="text-sm font-semibold mb-2 text-center text-gray-700 dark:text-gray-300">
        Scores by Period
      </h5>
      <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-center bg-white dark:bg-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="py-2 px-2 sm:px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Team
              </th>
              {/* Mapea los nombres de los periodos FILTRADOS */}
              {periodHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="py-2 px-2 sm:px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {/* *** CAMBIO: Columna Total eliminada *** */}
              {/* <th scope="col" className="py-2 px-2 sm:px-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider font-semibold">T</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Fila Equipo Visitante */}
            <tr className="text-sm text-gray-700 dark:text-gray-300">
              <td className="py-2 px-2 sm:px-3 font-medium text-left text-gray-900 dark:text-white">
                {visitorTeamAbbr || "Away"}
              </td>
              {/* Mapea sobre los scores FILTRADOS */}
              {filteredPeriodScores.map((period, index) => (
                <td
                  key={`${visitorTeamAbbr}-${index}`}
                  className="py-2 px-2 sm:px-3"
                >
                  {period.visitor_score ?? "-"}
                </td>
              ))}
              {/* *** CAMBIO: Celda Total eliminada *** */}
              {/* <td className="py-2 px-2 sm:px-3 font-semibold text-gray-900 dark:text-white">{visitorTotal ?? '-'}</td> */}
            </tr>
            {/* Fila Equipo Local */}
            <tr className="text-sm text-gray-700 dark:text-gray-300">
              <td className="py-2 px-2 sm:px-3 font-medium text-left text-gray-900 dark:text-white">
                {homeTeamAbbr || "Home"}
              </td>
              {/* Mapea sobre los scores FILTRADOS */}
              {filteredPeriodScores.map((period, index) => (
                <td
                  key={`${homeTeamAbbr}-${index}`}
                  className="py-2 px-2 sm:px-3"
                >
                  {period.home_score ?? "-"}
                </td>
              ))}
              {/* *** CAMBIO: Celda Total eliminada *** */}
              {/* <td className="py-2 px-2 sm:px-3 font-semibold text-gray-900 dark:text-white">{homeTotal ?? '-'}</td> */}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuarterScoresTable;
