import './ContentBlock.css';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useMemo, memo } from 'react';
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

// Chart.js 모듈 등록
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

  // 점수 기준 상위 8팀 (그래프용)
  const top8Teams = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          Math.max(...b.scores.map((s) => s.value)) -
          Math.max(...a.scores.map((s) => s.value))
      )
      .slice(0, 8);
  }, [data]);

  // 점수 기준 상위 3팀 (스코어보드용)
  const top3Teams = useMemo(() => top8Teams.slice(0, 3), [top8Teams]);

  // Chart 데이터 준비
  const chartData = useMemo(
    () => ({
      datasets: top8Teams.map(({ id, scores, color }) => ({
        label: id,
        data: scores.map(({ time, value }) => ({ x: time, y: value })),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.4)'),
        tension: 0,
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    }),
    [top8Teams]
  );

  // Chart 옵션
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#fff',
            padding: 20,
            generateLabels: function (chart) {
              // Chart.js v4에서는 chart.legend.legendItems을 직접 반환
              if (!chart || !chart.data || !chart.data.datasets) return [];

              return chart.data.datasets.map((dataset, i) => ({
                text: '', // 텍스트 제거
                fillStyle: dataset.borderColor || dataset.backgroundColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
              }));
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            stepSize: 30,
            tooltipFormat: 'HH:mm',
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
            },
          },
          adapters: {
            date: { locale: ko },
          },
          ticks: { color: '#333', autoSkip: false },
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
    }),
    []
  );


  return (
    <div className="content">
      {/* 차트 영역 */}
      <div className="chart-container">
        <Line
          key={top8Teams.map((d) => d.id).join(',')}
          data={chartData}
          options={chartOptions}
        />
      </div>

      {/* 팀 이름 라벨 */}
      <div className="team-labels">
        {top8Teams.map((team, idx) => (
          <span
            key={team.id}
            className="team-label"
            style={{ color: team.color }}
          >
            {team.id.length > 6 ? team.id.slice(0, 12) + '...' : team.id}
          </span>
        ))}
      </div>

      {/* 상위 3팀 스코어보드 */}
      <h1 className="title-text">TOP 3</h1>
      <ScoreRank
        data={top3Teams.map((team) => ({
          ...team,
          id: team.id.length > 6 ? team.id.slice(0, 6) + '...' : team.id,
        }))}
      />
    </div>
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
