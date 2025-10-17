import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useMemo, memo } from 'react';
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
import { ko } from 'date-fns/locale';

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
          unit: 'minute',          // 단위를 분 단위로 설정
          stepSize: 30,            // 30분 간격
          tooltipFormat: 'HH:mm',  // 마우스 오버 시 HH:mm 형식
          displayFormats: {
            minute: 'HH:mm',       // X축 눈금 표시 형식
            hour: 'HH:mm',         // 시간 단위일 때도 HH:mm
          },
        },
        adapters: {
          date: {
            locale: ko,          // 한국어 로케일
          },
        },
        ticks: {
          color: '#333',
          // source: 'data',
          audoSkip: false,
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
              {team.id.length > 6 ? team.id.slice(0, 12) + '...' : team.id}
            </TeamLabel>
            ))}
        </TeamLabels>

      {/* 상위 3팀 스코어보드 */}
      <TitleText>TOP 3</TitleText>
      {/* <ScoreRank data={top3Teams} /> */}
      <ScoreRank
        data={top3Teams.map(team => ({
          ...team,
          id: team.id.length > 6 ? team.id.slice(0, 6) + '...' : team.id,
        }))} 
      />
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

export default memo(ContentBlock);

const TitleText = styled.h1`
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
  background: linear-gradient(to right, #ff4500 20%, #dc0000 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  margin: 20px 0;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin: 15px 0;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    margin: 10px 0;
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  gap: 20px;
  margin-bottom: 100px;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 12px;
    margin-bottom: 60px;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 500px;

  @media (min-width: 768px) {
    height: 600px;
  }

  @media (max-width: 768px) {
    height: 400px;
  }

  @media (max-width: 480px) {
    height: 300px;
  }
`;

const TeamLabels = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  border-radius: 20px;
  padding: 15px;

  @media (max-width: 768px) {
    gap: 8px;
    padding: 10px;
  }

  @media (max-width: 480px) {
    gap: 6px;
    padding: 8px;
  }
`;

const TeamLabel = styled.span`
  flex: 1 1 calc(25% - 20px);
  min-width: 120px;
  text-align: center;
  color: ${props => props.color};
  font-weight: bold;
  font-size: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1024px) {
    flex: 1 1 calc(33.33% - 16px);
    min-width: 100px;
    font-size: 22px;
  }

  @media (max-width: 768px) {
    flex: 1 1 calc(50% - 12px);
    min-width: 80px;
    font-size: 18px;
  }

  @media (max-width: 480px) {
    flex: 1 1 100%;
    min-width: 60px;
    font-size: 16px;
  }
`;
