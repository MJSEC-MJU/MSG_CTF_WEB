import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import styled from 'styled-components';
import ScoreRank from './ScoreRank';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const ContentBlock = ({ dataset }) => {
  const { title, data } = dataset;

  // 점수 기준으로 상위 8팀 선택 (그래프용)
  const top8Teams = useMemo(() => {
    return [...data]
      .sort((a, b) => Math.max(...b.scores.map(s => s.value)) - Math.max(...a.scores.map(s => s.value)))
      .slice(0, 8);
  }, [data]);

  // 점수 기준 상위 3팀 선택 (스코어보드용)
  const top3Teams = useMemo(() => top8Teams.slice(0, 3), [top8Teams]);

  // Chart 데이터 준비
  const chartData = useMemo(() => ({
    datasets: top8Teams.map(({ id, scores, color }) => ({
      label: id,
      data: scores.map(({ time, value }) => ({ x: time, y: value })),
      borderColor: color,
      backgroundColor: color.replace('1)', '0.4)'),
      tension: 0,
      pointRadius: 3,
      pointHoverRadius: 5,
    })),
  }), [top8Teams]);

  // Chart 옵션
  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
      // title: { display: true, text: 'Score Progression', color: '#fff' },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'HH:mm',
          displayFormats: { hour: 'HH:mm' },
        },
        ticks: {
          color: '#333',
        },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          color: '#333',
          stepSize: 100,
          callback: (value) => Math.round(value / 100) * 100,
        },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
    },
  }), []);

  return (
    <Content>

      <ChartContainer>
        <Line
          key={top8Teams.map(d => d.id).join(',')}
          data={chartData}
          options={chartOptions}
        />
      </ChartContainer>

      {/* X축 아래 팀 이름 */}
      <TeamLabels>
          {top8Teams.map((team, idx) => (
            <TeamLabel
              key={team.id}
              color={team.color}
              style={{ left: `${(idx / (top8Teams.length - 1)) * 100}%` }}
            >
              {team.id}
            </TeamLabel>
            ))}
        </TeamLabels>

      {/* 상위 3팀 스코어보드 */}
      <TitleText>TOP 3</TitleText>
      <ScoreRank data={top3Teams} />
    </Content>
  );
};

ContentBlock.propTypes = {
  dataset: PropTypes.shape({
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        scores: PropTypes.arrayOf(
          PropTypes.shape({
            time: PropTypes.string.isRequired,
            value: PropTypes.number.isRequired,
          })
        ).isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default ContentBlock;

const TitleText = styled.h1`
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
  background: linear-gradient(to right, #ff4500 20%, #dc0000 100%);
  -webkit-background-clip: text;  /* 크롬, 사파리 */
  -webkit-text-fill-color: transparent;
  background-clip: text;          /* 파이어폭스 최신 버전 */
  color: transparent; 

`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 130%;
  gap: 20px;
  margin-bottom: 100px;
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 500px;
  @media (min-width: 768px) {
    height: 600px;
  }
`;

const TeamLabels = styled.div`
  display: flex;
  flex-wrap: wrap;   
  justify-content: center;
  gap: 10px -5px; // 줄 간격, 칸 간격
  margin-top: 10px;
  border-radius: 20px;      /* 모서리 둥글게 */
  padding: 15px;            /* 안쪽 여백 */
`;

const TeamLabel = styled.span`
  flex: 1 1 calc(25% - 20px); // 4개씩 배치되도록
  min-width: 120px;           // 너무 줄어들지 않게 최소 폭
  text-align: center;
  color: ${props => props.color};
  font-weight: bold;
  font-size: 25px;
`;
