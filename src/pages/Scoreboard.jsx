import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styled from 'styled-components';
import { useMemo } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Scoreboard = () => {
  const labels = [
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ];

  const players = useMemo(
    () => [
      {
        id: 'H4CK3R_01',
        scores: [400, 800, 900, 1200, 1300, 1400, 1500],
        color: 'rgba(255, 99, 132, 1)',
      },
      {
        id: 'D34D_B33F',
        scores: [200, 600, 1000, 1100, 1200, 1200, 1200],
        color: 'rgba(54, 162, 235, 1)',
      },
      {
        id: 'L33T_C0D3R',
        scores: [300, 400, 500, 700, 1100, 1400, 1500],
        color: 'rgba(255, 206, 86, 1)',
      },
    ],
    []
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: players.map((player) => ({
        label: player.id,
        data: player.scores,
        borderColor: player.color,
        backgroundColor: player.color.replace('1)', '0.4)'),
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      })),
    }),
    [labels, players]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#FFFFFF', font: { size: 14 } },
        },
      },
      scales: {
        x: {
          ticks: { color: '#FFFFFF', font: { size: 12 } },
          grid: { color: 'rgba(255, 255, 255, 0.2)' },
        },
        y: {
          ticks: { color: '#FFFFFF', font: { size: 12 } },
          grid: { color: 'rgba(255, 255, 255, 0.2)' },
        },
      },
    }),
    []
  );

  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      <Content>
        <ChartContainer>
          <Line data={data} options={options} />
        </ChartContainer>
        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>H4CK3R ID</th>
                <th>PWNED SCORE</th>
              </tr>
            </thead>
            <tbody>
              {players
                .map((player) => ({
                  ...player,
                  latestScore: player.scores[player.scores.length - 1],
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
      </Content>
    </Wrapper>
  );
};

export default Scoreboard;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0d0d0d;
  color: #ffffff;
  padding: 20px;
  width: 100%;
  height: 100vh;
  font-family: 'Courier New', Courier, monospace;
`;

const GlitchText = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #ffffff;
  text-shadow:
    0 0 8px #ffffff,
    0 0 16px #ffffff;
  animation: glitch 1s infinite alternate;

  @keyframes glitch {
    0% {
      text-shadow: 1px 1px #ffffff;
    }
    100% {
      text-shadow: -1px -1px #ffffff;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  gap: 20px;
`;

const ChartContainer = styled.div`
  width: 90%;
  max-width: 700px;
  height: 350px;

  @media (min-width: 768px) {
    width: 60%;
    height: 450px;
  }
`;

const TableContainer = styled.div`
  width: 90%;
  max-width: 400px;

  table {
    width: 100%;
    border-collapse: collapse;
    background-color: black;
    color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #ffffff;
  }

  th,
  td {
    border: 1px solid #ffffff;
    padding: 12px;
    text-align: center;
    font-size: 14px;
    font-family: 'Courier New', Courier, monospace;
  }

  th {
    background-color: #333;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #222;
  }

  tr:hover {
    background-color: #444;
  }
`;
