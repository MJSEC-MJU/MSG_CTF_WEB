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
    <RankingWrapper>
      <Title>Ranking</Title>
      <Table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Tier</th>
            <th>ID</th>
            <th>SCORE</th>
          </tr>
        </thead>
        <tbody>{displayScores}</tbody>
      </Table>
      <Pagination>
        <ReactPaginate
          previousLabel={'←'}
          nextLabel={'→'}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={'paginationBttns'}
          previousLinkClassName={'previousBttn'}
          nextLinkClassName={'nextBttn'}
          disabledClassName={'paginationDisabled'}
          activeClassName={'paginationActive'}
        />
      </Pagination>
    </RankingWrapper>
  );
};

export default Ranking;

const RankingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const Title = styled.h2`
  color: #8cff66;
  margin-bottom: 20px;
  text-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
`;

const Table = styled.table`
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  margin-bottom: 20px;

  th,
  td {
    border: 1px solid #333;
    padding: 10px;
    text-align: center;
    color: #fff;
    background-color: #222;
  }

  th {
    background-color: #000;
    color: #8cff66;
    cursor: pointer;
    &:hover {
      background-color: #333;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  .paginationBttns {
    display: flex;
    list-style: none;
    padding: 0;
    gap: 8px;
    font-size: 16px;
    cursor: pointer;
  }

  .previousBttn,
  .nextBttn {
    border: 1px solid #8cff66;
    background-color: transparent;
    cursor: pointer;
    color: #8cff66;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.1);
    }
  }

  .paginationDisabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #666;
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
`;
