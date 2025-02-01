// src/components/Scoreboard/ScoreTable.jsx
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ScoreTable = ({ data }) => (
  <TableContainer>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Latest Score</th>
        </tr>
      </thead>
      <tbody>
        {data
          .map(({ id, scores, color }) => ({
            id,
            latestScore: scores[scores.length - 1],
            color,
          }))
          .sort((a, b) => b.latestScore - a.latestScore)
          .map(({ id, latestScore, color }) => (
            <tr key={id}>
              <td style={{ color }}>{id}</td>
              <td>{latestScore}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </TableContainer>
);

ScoreTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      scores: PropTypes.arrayOf(PropTypes.number).isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ScoreTable;

const TableContainer = styled.div`
  width: 100%;
  max-width: 500px;
  table {
    width: 100%;
    border-collapse: collapse;
    background-color: black;
    color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
  }
  th,
  td {
    border: 1px solid #ffffff;
    padding: 12px;
    text-align: center;
    font-size: 14px;
  }
  th {
    background-color: #333;
  }
  tr:nth-child(even) {
    background-color: #222;
  }
  tr:hover {
    background-color: #444;
  }
`;
