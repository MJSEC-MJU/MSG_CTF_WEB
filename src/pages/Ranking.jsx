import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import ReactPaginate from 'react-paginate';

import BronzeIcon from '../assets/Ranking/BronzeIcon.svg';
import SilverIcon from '../assets/Ranking/SilverIcon.svg';
import GoldIcon from '../assets/Ranking/GoldIcon.svg';
import PlatinumIcon from '../assets/Ranking/PlatinumIcon.svg';
import DiamondIcon from '../assets/Ranking/DiamondIcon.svg';
import ChallengerIcon from '../assets/Ranking/ChallengerIcon.svg';
import Loading from '../components/Loading';

const Ranking = () => {
  const [scores, setScores] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const scoresPerPage = 10;
  const pagesVisited = pageNumber * scoresPerPage;
  const pageCount = Math.ceil(scores.length / scoresPerPage);

  // 더미 데이터 (SSE 대신 임시로 테스트용)
const dummyScores = [
  { id: 1, userId: "playerOne", totalPoint: 1520 },
  { id: 2, userId: "cyberKing", totalPoint: 1480 },
  { id: 3, userId: "hackerPro", totalPoint: 1455 },
  { id: 4, userId: "matrixNeo", totalPoint: 1402 },
  { id: 5, userId: "codeMaster", totalPoint: 1389 },
  { id: 6, userId: "darkKnight", totalPoint: 1370 },
  { id: 7, userId: "greenArrow", totalPoint: 1355 },
  { id: 8, userId: "silverFox", totalPoint: 1348 },
  { id: 9, userId: "quantumAI", totalPoint: 1330 },
  { id: 10, userId: "binaryHero", totalPoint: 1325 },
  { id: 11, userId: "cryptoNinja", totalPoint: 1308 },
  { id: 12, userId: "fireDragon", totalPoint: 1290 },
  { id: 13, userId: "ghostHunter", totalPoint: 1282 },
  { id: 14, userId: "stormBreaker", totalPoint: 1275 },
  { id: 15, userId: "ironShield", totalPoint: 1266 },
  { id: 16, userId: "shadowWolf", totalPoint: 1255 },
  { id: 17, userId: "bluePhoenix", totalPoint: 1248 },
  { id: 18, userId: "digitalSamurai", totalPoint: 1242 },
  { id: 19, userId: "netRunner", totalPoint: 1235 },
  { id: 20, userId: "starDust", totalPoint: 1220 },
];

    useEffect(() => {
    // 🔹 SSE 대신 더미 데이터 사용
    setScores(dummyScores);
    setLoading(false);
  }, []);

  // useEffect(() => {
  //   let eventSource = null;
  //   let reconnectInterval = null;

  //   const connectSSE = () => {
  //     // 기존 연결 종료
  //     if (eventSource) {
  //       eventSource.close();
  //       eventSource = null;
  //     }
      
  //     eventSource = new EventSource(
  //       'https://msg.mjsec.kr/api/leaderboard/stream'
  //     );
      
  //     eventSource.onopen = () => {
  //       //console.log('✅ SSE 연결이 열렸습니다.');
  //     };

  //     eventSource.onmessage = (event) => {
  //       try {
  //         //console.log('📩 수신된 데이터:', event.data);
  //         const parsedData = JSON.parse(event.data);
  //         let dataArray = [];
  //         if (Array.isArray(parsedData)) {
  //           dataArray = parsedData;
  //         } else if (parsedData && Array.isArray(parsedData.data)) {
  //           dataArray = parsedData.data;
  //         } else {
  //           throw new Error('응답 데이터 형식이 올바르지 않습니다.');
  //         }
  //         setScores(dataArray);
  //         if (loading) {
  //           setLoading(false);
  //         }
  //       } catch (error) {
  //         //console.error('❌ 데이터 파싱 오류:', error.message);
  //       }
  //     };

  //     eventSource.onerror = (error) => {
  //       //console.error('❌ SSE 오류 발생:', error);
  //       eventSource.close();
  //     };
  //   };

  //   // 최초 SSE 연결
  //   connectSSE();

  //   // 1시간마다 재연결 (60분 * 60초 * 1000ms)
  //   reconnectInterval = setInterval(connectSSE, 60 * 60 * 1000);

  //   // 클린업: 컴포넌트 언마운트 시 SSE 연결과 인터벌 종료
  //   return () => {
  //     if (eventSource) eventSource.close();
  //     if (reconnectInterval) clearInterval(reconnectInterval);
  //   };
  // }, [loading]);

  const getIconForRank = (rank) => {
    if (rank >= 1 && rank <= 3) return ChallengerIcon;
    if (rank >= 4 && rank <= 8) return DiamondIcon;
    if (rank >= 9 && rank <= 14) return PlatinumIcon;
    if (rank >= 15 && rank <= 30) return GoldIcon;
    if (rank >= 31 && rank <= 60) return SilverIcon;
    return BronzeIcon;
  };

  const displayScores = useMemo(() => {
    const slicedScores = scores.slice(
      pagesVisited,
      pagesVisited + scoresPerPage
    );
    const rows = slicedScores.map((score, index) => {
      const rank = pagesVisited + index + 1;

      const userId = score.userId
        ? score.userId.replace(/.(?=.{3})/g, '*')
        : '알 수 없음';
      return (
        <tr key={score.id || rank}>
          <td>{rank}</td>
          <td>
            <img
              src={getIconForRank(rank)}
              alt={`Rank ${rank}`}
              style={{ width: '30px', height: '30px' }}
            />
          </td>
          <td>{userId}</td>
          <td>{score.totalPoint}</td>
        </tr>
      );
    });

    // 페이지에 부족한 데이터가 있을 경우 빈 행 추가
    for (let i = rows.length; i < scoresPerPage; i++) {
      rows.push(
        <tr key={`empty-${i}`}>
          <td>----</td>
          <td>----</td>
          <td>----</td>
          <td>----</td>
        </tr>
      );
    }
    return rows;
  }, [pageNumber, scores, pagesVisited, scoresPerPage]);

  const changePage = ({ selected }) => setPageNumber(selected);

  if (loading) {
    return (
      <RankingWrapper>
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      </RankingWrapper>
    );
  }

return (
  <ResponsiveWrapper>
    <RankingWrapper>
      <Title>Ranking</Title>
      <List>
        {scores.map((score, index) => {
          const rank = index + 1;
          return (
            <Card key={score.id} top3={rank <= 3}>
              <Rank top3={rank <= 3}>
              <RankNumber top3={rank <= 3}>{rank}</RankNumber>
                <User>{score.userId}</User>
              </Rank>
              <Score top3={rank <=3 }>{score.totalPoint}</Score>
            </Card>
          );
        })}
      </List>
    </RankingWrapper>
  </ResponsiveWrapper>
  );
};

export default Ranking;

// 스타일 정의

const RankingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh; /* 화면 전체 높이 확보 */
  padding: 20px 40px; /* 상하좌우 여백 */
`;

const Title = styled.h2`
  margin-top: 70px;
  margin-bottom: 20px;
  font-size: 2rem;
  align-self: flex-start;
  font-family: 'Courier New', Courier, monospace; // 수정 필요.


    /* 🔥 텍스트 위아래 그라데이션 */
  background: linear-gradient(to bottom, #ff9000 20%, #dc0000 100%); 
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  /* 앞에 | 기호 추가 */
  position: relative;
  &::before {
    content: '|';
    margin-right: 8px;
    color: linear-gradient(to bottom, #ff9000 20%, #dc0000 100%); 
    font-weight: bold;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 1000px;
  max-width: 1000px; /* 최대 폭 제한 */
  margin: 0 auto;    /* 중앙 정렬 */
`;

const Card = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background: "#f9f9f9";
  border: 3px solid #aaa;
  border-radius: 6px;
  padding: 16px;
  font-size: 1.2rem;
`;

const Rank = styled.div`
  flex: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: bold;
  color: ${(props) => (props.top3 ? "#000" : "#5e5e5e")};

`;

const RankNumber = styled.span`
  position: relative;
  display: inline-block;
  width: 40px;   /* 숫자 영역 크기 */
  height: 40px;  /* 이미지 크기와 맞춤 */
  text-align: center;
  line-height: 40px; /* 세로 중앙 정렬 */
  font-weight: bold;
  font-size: 1.5rem;
  z-index: 1; /* 숫자 위 */

  /* 불꽃 이미지를 배경으로 */
  background: ${(props) =>
  props.top3 ? "url('/src/assets/Ranking/flame.png') no-repeat center center" : "none"};
  background-size: contain; /* 비율 유지하면서 맞춤 */
`;


const User = styled.span`
  flex: 3;
  font-weight: 500;
  text-align: center;
  font-size: 1.5rem;
`;

const Score = styled.span`
  flex: 0.5;
  font-weight: bold;
  font-size: 35px;

  ${(props) =>
    props.top3
      ? `
        background: linear-gradient(to bottom, #ff8000 33% , #ff0000 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-text-stroke: 1px #242323;
      `
      : `
        color: #333; /* 4위 이후는 그냥 일반 색 */
      `}
`;


// 반응형: 모바일에서 리스트 폭 줄이기
const ResponsiveWrapper = styled.div`
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    ${List} {
      max-width: 100%;
    }

    ${Card} {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    ${Rank} {
      width: 100%;
      justify-content: flex-start;
    }

    ${Score} {
      width: 100%;
      text-align: left;
    }
  }
`;