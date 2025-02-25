export const options = {
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

// 최대 3명까지 색상을 다르게 설정
const individualColors = ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgb(75, 192, 98)'];
const universityColors = ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgb(0, 255, 251)'];

export let datasetsConfig = [];

// SSE를 이용한 데이터 업데이트 함수
export const fetchLeaderboardData = (setDatasetsConfig) => {
  const eventSource = new EventSource('https://msg.mjsec.kr/api/leaderboard/stream');

  eventSource.onopen = () => {
    console.log('✅ SSE 연결이 열렸습니다.');
  };

  eventSource.onmessage = (event) => {
    try {
      console.log('📩 수신된 데이터:', event.data);
      const parsedData = JSON.parse(event.data);

      if (!Array.isArray(parsedData)) {
        throw new Error('응답 데이터 형식이 잘못되었습니다.');
      }

      // 개인 랭킹 처리
      const individualRanking = [];
      const universityRanking = {};

      let individualColorIndex = 0;  // 개인 랭킹 색상 인덱스
      const universityColorIndices = {};  // 대학별 색상 인덱스 관리

      parsedData.forEach((item, index) => {
        const university = item.univ || 'Individual Ranking'; // 대학이 없으면 개인 랭킹

        let color;

        // 개인 랭킹 색상 적용 (대학이 있어도 개인 랭킹에 포함)
        color = individualColors[individualColorIndex % individualColors.length];
        individualColorIndex++;  // 개인 색상 인덱스 증가

        // 개인 랭킹에 데이터 추가
        individualRanking.push({
          id: item.userid,
          scores: [item.totalPoint],
          color,
          lastSolvedTime: item.lastSolvedTime,
        });

        // 대학별 랭킹 추가 (대학이 있는 경우)
        if (university !== 'Individual Ranking') {
          if (!universityColorIndices[university]) {
            universityColorIndices[university] = 0;  // 대학 색상 배열 인덱스 초기화
          }
          color = universityColors[universityColorIndices[university] % universityColors.length];
          universityColorIndices[university]++;  // 대학 색상 인덱스 증가

          // 대학별 랭킹에 데이터 추가
          if (!universityRanking[university]) {
            universityRanking[university] = [];
          }
          universityRanking[university].push({
            id: university,  // 대학이 id로 사용
            scores: [item.totalPoint],
            color,
            lastSolvedTime: item.lastSolvedTime,
          });
        }
      });

      // 대학별 데이터 처리 (각 대학별로 합산된 점수)
      const groupedUniversityData = Object.keys(universityRanking).map((univ) => ({
        title: univ,
        data: universityRanking[univ].map((user) => ({
          id: user.id,  // university가 id로 사용됨
          scores: user.scores,
          color: user.color,
          lastSolvedTime: user.lastSolvedTime,
        })),
      }));

      // 데이터 결합: 개인 랭킹과 대학별 랭킹을 합쳐서 datasetsConfig에 저장
      datasetsConfig = [
        { title: 'Individual Ranking', data: individualRanking },
        ...groupedUniversityData,
      ];

      console.log('✅ 업데이트된 datasetsConfig:', datasetsConfig);
      setDatasetsConfig(datasetsConfig);
    } catch (err) {
      console.error('❌ 데이터 처리 중 오류 발생:', err.message);
    }
  };

  eventSource.onerror = (error) => {
    console.error('🚨 SSE 오류 발생:', error);
    eventSource.close();
  };
};