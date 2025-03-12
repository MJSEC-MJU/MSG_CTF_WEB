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
const individualColors = ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(99, 255, 182,1)'];
const universityColors = ['rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 88, 116,1)'];

export let datasetsConfig = [];
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

      // **X축(시간) 생성**
      const timeLabels = [...new Set(parsedData.map(item => item.lastSolvedTime))].sort();

      // 개인 및 대학별 랭킹 데이터 저장
      const individualRanking = {};
      const universityTotalScores = {}; // 대학별 총 점수 저장

      parsedData.forEach((item) => {
        const userId = item.userid;
        const university = item.univ || 'Individual Ranking';
        const timeIndex = timeLabels.indexOf(item.lastSolvedTime);

        // **1. 개인 점수 기록**
        if (!individualRanking[userId]) {
          individualRanking[userId] = {
            id: userId,
            scores: Array(timeLabels.length).fill(null),
            color: individualColors[Object.keys(individualRanking).length % individualColors.length],
          };
        }
        individualRanking[userId].scores[timeIndex] = item.totalPoint;

        // **2. 개인 랭킹의 빈 점수 채우기 (이전 값 유지)**
        for (let i = 1; i < timeLabels.length; i++) {
          if (individualRanking[userId].scores[i] === null) {
            individualRanking[userId].scores[i] = individualRanking[userId].scores[i - 1] ?? 0;
          }
        }

        // **3. 대학별 총합 점수 계산**
        if (university !== 'Individual Ranking') {
          if (!universityTotalScores[university]) {
            universityTotalScores[university] = {
              id: university,
              scores: Array(timeLabels.length).fill(0), // 기본값 0으로 초기화
              color: universityColors[Object.keys(universityTotalScores).length % universityColors.length],
            };
          }
          
          // 해당 시간대의 점수를 합산
          universityTotalScores[university].scores[timeIndex] += item.totalPoint;
        }
      });

      // **4. 대학별 점수 누적 처리**
      Object.values(universityTotalScores).forEach((univ) => {
        for (let i = 1; i < timeLabels.length; i++) {
          // **누적 합산**: 이전 점수에 추가
          if (univ.scores[i] === 0) {
            univ.scores[i] = univ.scores[i - 1] ?? 0;
          } else {
            univ.scores[i] += univ.scores[i - 1] ?? 0;  // 누적 합산
          }
        }
      });

      // **5. 상위 3명만 필터링**
      const topIndividuals = Object.values(individualRanking)
        .sort((a, b) => b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1])
        .slice(0, 3);

      // **6. 최종 데이터 설정 및 setDatasetsConfig 호출**
      const finalData = [
        { title: 'Individual Ranking', data: topIndividuals, labels: timeLabels },
        { title: 'University Ranking', data: Object.values(universityTotalScores), labels: timeLabels }
      ];

      setDatasetsConfig(finalData);

      console.log('✅ 업데이트된 datasetsConfig:', finalData);
    } catch (err) {
      console.error('❌ 데이터 처리 중 오류 발생:', err.message);
    }
  };

  eventSource.onerror = (error) => {
    console.error('🚨 SSE 오류 발생:', error);
    eventSource.close();
  };
};



