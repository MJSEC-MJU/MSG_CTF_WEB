import PropTypes from 'prop-types';
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

const labels = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

const datasetsConfig = [
  {
    title: 'Individual Hacker Scores',
    data: [
      {
        id: 'user1',
        scores: [400, 800, 900, 1200, 1300, 1400, 1500],
        color: 'rgba(255, 99, 132, 1)',
      },
      {
        id: 'user2',
        scores: [200, 600, 1000, 1100, 1200, 1200, 1200],
        color: 'rgba(54, 162, 235, 1)',
      },
      {
        id: 'user3',
        scores: [300, 400, 500, 700, 1100, 1400, 1500],
        color: 'rgba(255, 206, 86, 1)',
      },
    ],
  },
  {
    title: 'University Rankings',
    data: [
      {
        id: 'Myongji Univ.',
        scores: [500, 700, 850, 1100, 1250, 1350, 1450],
        color: 'rgba(75, 192, 192, 1)',
      },
      {
        id: 'Seoul Univ.',
        scores: [300, 550, 750, 950, 1150, 1250, 1300],
        color: 'rgba(153, 102, 255, 1)',
      },
      {
        id: 'Yonsei Univ.',
        scores: [400, 600, 850, 1050, 1200, 1400, 1500],
        color: 'rgba(255, 159, 64, 1)',
      },
    ],
  },
];

const options = {
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
};

const Scoreboard = () => {
  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      {datasetsConfig.map((dataset) => (
        <ContentBlock key={dataset.title} dataset={dataset} />
      ))}
    </Wrapper>
  );
};

const ContentBlock = ({ dataset }) => {
  const { title, data } = dataset;

  const chartData = useMemo(
    () => ({
      labels,
      datasets: data.map(({ id, scores, color }) => ({
        label: id,
        data: scores,
        borderColor: color,
        backgroundColor: color.replace('1)', '0.4)'),
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      })),
    }),
    [data]
  );

  return (
    <Content>
      <TitleText>{title}</TitleText>
      <ChartContainer>
        <Line data={chartData} options={options} />
      </ChartContainer>
      <ScoreTable data={data} />
    </Content>
  );
};

ContentBlock.propTypes = {
  dataset: PropTypes.shape({
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        scores: PropTypes.arrayOf(PropTypes.number).isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

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

export default Scoreboard;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0d0d0d;
  color: #8cff66;
  padding: 20px;
  width: 100%;
`;

const GlitchText = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #8cff66;
  text-shadow: 0 0 10px #ffffff;
`;

const TitleText = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;
  margin-bottom: 100px;
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 900px;
  height: 400px;
  @media (min-width: 768px) {
    height: 500px;
  }
`;

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
