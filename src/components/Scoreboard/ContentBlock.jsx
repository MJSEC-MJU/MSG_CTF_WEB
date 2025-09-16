// import PropTypes from 'prop-types';
// import { Line } from 'react-chartjs-2';
// import { useMemo } from 'react';
// import styled from 'styled-components';
// import { options } from './dataConfig';
// import ScoreTable from './ScoreTable';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const ContentBlock = ({ dataset }) => {
//   const { title, data, labels } = dataset;

//   const chartData = useMemo(
//     () => ({
//       // labels, // 동적으로 받은 labels 사용
//       labels: ["Start", "End"], // 라벨은 고정 2개만
//       datasets: data.map(({ id, scores, color }) => {
//         const first = scores[0];
//         const last = scores[scores.length - 1];
//         return{
//           label: id,
//           // data: scores,
//           data: [first, last], // 점수는 처음과 마지막 점수만 사용
//           borderColor: color,
//           backgroundColor: color.replace('1)', '0.4)'),
//           tension: 0.4,
//           pointRadius: 6,
//           pointHoverRadius: 8,
//         }
        
//       }),
//     }),
//     [data, labels]
//   );

//   return (
//     <Content>
//       <TitleText>{title}</TitleText>
//       <ChartContainer>
//         <Line data={chartData} options={options} />
//       </ChartContainer>
//       <ScoreTable data={data} />
//     </Content>
//   );
// };

// ContentBlock.propTypes = {
//   dataset: PropTypes.shape({
//     title: PropTypes.string.isRequired,
//     labels: PropTypes.arrayOf(PropTypes.string).isRequired,
//     data: PropTypes.arrayOf(
//       PropTypes.shape({
//         id: PropTypes.string.isRequired,
//         scores: PropTypes.arrayOf(PropTypes.number).isRequired,
//         color: PropTypes.string.isRequired,
//       })
//     ).isRequired,
//   }).isRequired,
// };

// export default ContentBlock;

// const TitleText = styled.h2`
//   font-size: 2rem;
//   font-weight: bold;
//   margin-bottom: 10px;
// `;

// const Content = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   width: 100%;
//   gap: 20px;
//   margin-bottom: 100px;
// `;

// const ChartContainer = styled.div`
//   width: 100%;
//   max-width: 900px;
//   height: 400px;
//   @media (min-width: 768px) {
//     height: 500px;
//   }
// `;


import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { useMemo } from 'react';
import styled from 'styled-components';
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

  // Chart 데이터 준비
  const chartData = useMemo(() => ({
    datasets: data.slice(0,8).map(({ id, scores, color }) => {
      return {
        label: id,
        data: scores.map(({ time, value }) => ({ x: time, y: value })),
        borderColor: color,
        backgroundColor: color.replace('1)', '0.4)'),
        tension: 0,
        pointRadius: 3,
        pointHoverRadius: 5,
      };
    }),
  }), [data]);

  // Chart 옵션
  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#ffffff' } },
      title: { display: true, text: 'Score Progression', color: '#ffffff' },
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
          // 눈금마다 HH:mm 표시
          callback: (value, index, ticks) => {
            const date = new Date(value);
            return date.getUTCHours().toString().padStart(2, '0') + ':00';
          },
        },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
      y: {
        ticks: { color: '#333', callback: (value) => `${Math.round(value / 100) * 100}`, stepSize: 100, },
        grid: { color: 'rgba(255,255,255,0.2)' },
      },
    },
  }), []);

  return (
    <Content>
      <TitleText>{title}</TitleText>
      <ChartContainer>
        {/* key를 id 합치기로 주어 Canvas 충돌 방지 */}
        <Line key={data.map(d => d.id).join(',')} data={chartData} options={chartOptions} />
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

const TitleText = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
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
