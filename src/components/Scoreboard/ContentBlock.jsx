// src/components/Scoreboard/ContentBlock.jsx
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import styled from 'styled-components';
import { options } from './dataConfig';
import ScoreTable from './ScoreTable';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ContentBlock = ({ dataset }) => {
  const { title, data } = dataset;

  const chartData = useMemo(
    () => ({
      labels: ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'],
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

export default ContentBlock;

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
