import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import styled from 'styled-components';
import PropTypes from 'prop-types';
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

// ------------------------------
// 차트 옵션
const chartOptions = {
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
      grid: { color: 'rgba(255,255,255,0.2)' },
    },
    y: {
      ticks: { color: '#FFFFFF', font: { size: 12 } },
      grid: { color: 'rgba(255,255,255,0.2)' },
    },
  },
};

// ------------------------------
// 색상 상수
const individualColors = [
  'rgba(54, 162, 235, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(99, 255, 182, 1)',
];
const universityColors = [
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(255, 88, 116, 1)',
];

// ------------------------------
// 그래프 데이터(SSE) 훅
const useGraphData = () => {
  const [graphData, setGraphData] = useState([]);
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const url = `https://msg.mjsec.kr/api/leaderboard/graph`;

    const eventSource = new EventSource(url);
    console.log('[Graph SSE] 연결 시도:', url);

    eventSource.onopen = () => {
      console.log('[Graph SSE] 연결 성공');
    };

    eventSource.onmessage = (e) => {
      console.log('[Graph SSE] raw data:', e.data);
      // 서버에서 "update" 접두어가 붙어올 경우 제거
      let dataStr = e.data;
      if (dataStr.startsWith('update')) {
        dataStr = dataStr.replace(/^update\s+/, '');
      }
      try {
        const parsed = JSON.parse(dataStr);
        console.log('[Graph SSE] 파싱 성공:', parsed);
        setGraphData(parsed);
        setLoadingGraph(false);
      } catch (err) {
        console.error('[Graph SSE] 데이터 파싱 에러:', err);
        setError(err);
        setLoadingGraph(false);
      }
    };

    eventSource.onerror = (err) => {
      console.error('[Graph SSE] 에러 발생:', err);
      // 에러가 발생해도 이미 데이터가 수신된 경우에는 loading 해제
      setLoadingGraph(false);
      // 만약 에러 상태를 사용자에게 보여주고 싶다면 아래 주석을 해제하세요.
      // setError(err);
    };

    return () => {
      console.log('[Graph SSE] 연결 종료');
      eventSource.close();
    };
  }, []);

  return { graphData, loadingGraph, error };
};

// ------------------------------
// 순위표 데이터(SSE) 훅
const useStreamData = () => {
  const [streamData, setStreamData] = useState([]);
  const [loadingStream, setLoadingStream] = useState(true);

  useEffect(() => {
    const url = 'https://msg.mjsec.kr/api/leaderboard/stream';
    const eventSource = new EventSource(url);
    console.log('[Stream SSE] 연결 시도:', url);

    eventSource.onopen = () => {
      console.log('[Stream SSE] 연결 성공');
    };

    eventSource.onmessage = (e) => {
      console.log('[Stream SSE] raw data:', e.data);
      try {
        const parsed = JSON.parse(e.data);
        console.log('[Stream SSE] 파싱 성공:', parsed);
        setStreamData(parsed);
      } catch (err) {
        console.error('[Stream SSE] 데이터 파싱 에러:', err);
      }
      setLoadingStream(false);
      eventSource.close();
    };

    eventSource.onerror = (err) => {
      console.error('[Stream SSE] 에러 발생:', err);
      setLoadingStream(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { streamData, loadingStream };
};

// ------------------------------
// 그래프 데이터 가공 함수 (누적 합산)
const processGraphData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [
      { title: 'Individual Graph', labels: [], data: [] },
      { title: 'University Graph', labels: [], data: [] },
    ];
  }
  const timeLabels = Array.from(new Set(data.map((d) => d.solvedTime))).sort();

  const individualMap = {};
  const universityMap = {};

  data.forEach((item) => {
    const { userId, univ } = item;
    const score = item.dynamicScore || item.currentScore || 0;
    const tIndex = timeLabels.indexOf(item.solvedTime);

    if (!individualMap[userId]) {
      individualMap[userId] = {
        id: userId,
        scores: Array(timeLabels.length).fill(0),
      };
    }
    individualMap[userId].scores[tIndex] += score;

    if (univ) {
      if (!universityMap[univ]) {
        universityMap[univ] = {
          id: univ,
          scores: Array(timeLabels.length).fill(0),
        };
      }
      universityMap[univ].scores[tIndex] += score;
    }
  });

  Object.values(individualMap).forEach((entry) => {
    for (let i = 1; i < timeLabels.length; i++) {
      entry.scores[i] += entry.scores[i - 1];
    }
  });
  Object.values(universityMap).forEach((entry) => {
    for (let i = 1; i < timeLabels.length; i++) {
      entry.scores[i] += entry.scores[i - 1];
    }
  });

  const individualData = Object.values(individualMap).map((entry, idx) => ({
    ...entry,
    color: individualColors[idx % individualColors.length],
  }));
  const universityData = Object.values(universityMap).map((entry, idx) => ({
    ...entry,
    color: universityColors[idx % universityColors.length],
  }));

  return [
    { title: 'Individual Graph', labels: timeLabels, data: individualData },
    { title: 'University Graph', labels: timeLabels, data: universityData },
  ];
};

// ------------------------------
// 순위표 데이터 가공 함수 (정렬 및 Top3)
const processScoreboardData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [
      { title: 'Individual Scoreboard', labels: ['Score'], data: [] },
      { title: 'University Scoreboard', labels: ['Score'], data: [] },
    ];
  }

  const individualMap = {};
  data.forEach((item) => {
    const userId = item.userid || item.user_id;
    const score = item.totalPoint || item.total_point || 0;
    if (!individualMap[userId] || score > individualMap[userId].score) {
      individualMap[userId] = { id: userId, score };
    }
  });
  const individualData = Object.values(individualMap)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry, idx) => ({
      id: entry.id,
      scores: [entry.score],
      color: individualColors[idx % individualColors.length],
    }));

  const universityMap = {};
  data.forEach((item) => {
    const univ = item.univ;
    if (!univ) return;
    const score = item.totalPoint || item.total_point || 0;
    const lastSolvedTime = item.lastSolvedTime || item.last_solved_time || '';
    if (!universityMap[univ]) {
      universityMap[univ] = { id: univ, score, lastSolvedTime };
    } else {
      universityMap[univ].score += score;
      if (
        lastSolvedTime &&
        universityMap[univ].lastSolvedTime &&
        lastSolvedTime < universityMap[univ].lastSolvedTime
      ) {
        universityMap[univ].lastSolvedTime = lastSolvedTime;
      }
    }
  });
  const universityData = Object.values(universityMap)
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.lastSolvedTime.localeCompare(b.lastSolvedTime);
      }
      return b.score - a.score;
    })
    .map((entry, idx) => ({
      id: entry.id,
      scores: [entry.score],
      color: universityColors[idx % universityColors.length],
    }));

  return [
    {
      title: 'Individual Scoreboard',
      labels: ['Score'],
      data: individualData,
    },
    {
      title: 'University Scoreboard',
      labels: ['Score'],
      data: universityData,
    },
  ];
};

// ------------------------------
// 차트 섹션 컴포넌트
const ChartSection = ({ dataset }) => {
  const { title, labels, data } = dataset;
  const chartData = useMemo(
    () => ({
      labels,
      datasets: data.map((entry) => ({
        label: entry.id,
        data: entry.scores,
        borderColor: entry.color,
        backgroundColor: entry.color.replace('1)', '0.4)'),
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      })),
    }),
    [labels, data]
  );

  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <Line data={chartData} options={chartOptions} />
    </Section>
  );
};

ChartSection.propTypes = {
  dataset: PropTypes.shape({
    title: PropTypes.string.isRequired,
    labels: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        scores: PropTypes.arrayOf(PropTypes.number).isRequired,
        color: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

// ------------------------------
// 순위표 섹션 컴포넌트
const ScoreTable = ({ dataset }) => {
  const sortedData = dataset.data
    .map((entry) => ({
      id: entry.id,
      latestScore: entry.scores[entry.scores.length - 1],
      color: entry.color,
    }))
    .sort((a, b) => b.latestScore - a.latestScore);

  return (
    <TableWrapper>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Latest Score</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.id}>
              <td style={{ color: item.color }}>{item.id}</td>
              <td>{item.latestScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
};

ScoreTable.propTypes = {
  dataset: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        scores: PropTypes.arrayOf(PropTypes.number).isRequired,
        color: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

// ------------------------------
// 메인 Scoreboard 컴포넌트
const Scoreboard = () => {
  const { graphData, loadingGraph, error } = useGraphData();
  const { streamData, loadingStream } = useStreamData();

  const [individualGraph, universityGraph] = processGraphData(graphData);
  const [individualScoreboard, universityScoreboard] =
    processScoreboardData(streamData);

  if (loadingGraph || loadingStream) {
    return (
      <Wrapper>
        <LoadingWrapper>
          <Loading>Loading...</Loading>
        </LoadingWrapper>
      </Wrapper>
    );
  }

  if (error && graphData.length === 0) {
    return (
      <Wrapper>
        <ErrorText>그래프 데이터를 불러오지 못했습니다.</ErrorText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      <ChartSection dataset={individualGraph} />
      <ChartSection dataset={universityGraph} />
      <ScoreTable dataset={individualScoreboard} />
      <ScoreTable dataset={universityScoreboard} />
      {graphData.length === 0 && streamData.length === 0 && (
        <NoDataText>No data available</NoDataText>
      )}
    </Wrapper>
  );
};

export default Scoreboard;

// ------------------------------
// 스타일 컴포넌트
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;
const GlitchText = styled.h1`
  margin-top: 80px;
  color: #8cff66;
  margin-bottom: 20px;
  text-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
`;
const NoDataText = styled.p`
  font-size: 1.5rem;
  color: red;
  margin-top: 20px;
`;
const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
`;
const Loading = styled.div`
  font-size: 1.5rem;
  color: #ffffff;
`;
const ErrorText = styled.div`
  font-size: 1.5rem;
  color: red;
  margin-top: 20px;
`;
const Section = styled.div`
  width: 100%;
  max-width: 900px;
  margin-bottom: 50px;
`;
const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;
const TableWrapper = styled.div`
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
