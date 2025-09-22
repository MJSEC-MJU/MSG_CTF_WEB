// import PropTypes from 'prop-types';
// import styled from 'styled-components';

// const ScoreTable = ({ data }) => (
//   <TableContainer>
//     <table>
//       <thead>
//         <tr>
//           <th>ID</th>
//           <th>Latest Score</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data
//           .map(({ id, scores, color }) => ({
//             id,
//             latestScore: scores[scores.length - 1],
//             color,
//           }))
//           .sort((a, b) => b.latestScore - a.latestScore)
//           .map(({ id, latestScore, color }) => (
//             <tr key={id}>
//               <td style={{ color }}>{id}</td>
//               <td>{latestScore}</td>
//             </tr>
//           ))}
//       </tbody>
//     </table>
//   </TableContainer>
// );

// ScoreTable.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       scores: PropTypes.arrayOf(PropTypes.number).isRequired,
//       color: PropTypes.string.isRequired,
//     })
//   ).isRequired,
// };

// export default ScoreTable;

// const TableContainer = styled.div`
//   width: 100%;
//   max-width: 500px;
//   table {
//     width: 100%;
//     border-collapse: collapse;
//     background-color: black;
//     color: #ffffff;
//     border-radius: 8px;
//     overflow: hidden;
//   }
//   th,
//   td {
//     border: 1px solid #ffffff;
//     padding: 12px;
//     text-align: center;
//     font-size: 14px;
//   }
//   th {
//     background-color: #333;
//   }
//   tr:nth-child(even) {
//     background-color: #222;
//   }
//   tr:hover {
//     background-color: #444;
//   }
// `;


// import PropTypes from 'prop-types';
// import styled from 'styled-components';

// const ScoreTable = ({ data }) => (
//   <TableContainer>
//     <table>
//       <thead>
//         <tr>
//           <th>ID</th>
//           <th>Latest Score</th>
//         </tr>
//       </thead>
//       <tbody>
//         {data
//           .map(({ id, scores, color }) => ({
//             id,
//             latestScore: scores[scores.length - 1]?.value ?? 0,
//             color,
//           }))
//           .sort((a, b) => b.latestScore - a.latestScore)
//           .map(({ id, latestScore, color }) => (
//             <tr key={id}>
//               <td style={{ color }}>{id}</td>
//               <td>{latestScore}</td>
//             </tr>
//           ))}
//       </tbody>
//     </table>
//   </TableContainer>
// );

// ScoreTable.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       scores: PropTypes.arrayOf(
//         PropTypes.shape({
//           time: PropTypes.string.isRequired,
//           value: PropTypes.number.isRequired,
//         })
//       ).isRequired,
//       color: PropTypes.string.isRequired,
//     })
//   ).isRequired,
// };

// export default ScoreTable;

// const TableContainer = styled.div`
//   width: 100%;
//   max-width: 500px;
//   table {
//     width: 100%;
//     border-collapse: collapse;
//     background-color: black;
//     color: #ffffff;
//     border-radius: 8px;
//     overflow: hidden;
//   }
//   th,
//   td {
//     border: 1px solid #ffffff;
//     padding: 12px;
//     text-align: center;
//     font-size: 14px;
//   }
//   th {
//     background-color: #fff;
//   }
//   tr:nth-child(even) {
//     background-color: #222;
//   }
//   tr:hover {
//     background-color: #444;
//   }
// `;

// const TableContainer = styled.div`
//   width: 100%;
//   max-width: 500px;

//   table {
//     width: 100%;
//     border-collapse: collapse;
//     background-color: #ffffff; /* 표 내부 흰색 */
//     color: #000000; /* 글자 검정 */
//     border: 0.3px solid #000000; /* 표 전체 테두리 */
//     border-radius: 8px;
//     overflow: hidden;
//   }

//   th,
//   td {
//     border: 3px solid #000000; /* 각 셀 테두리 검정 */
//     padding: 12px;
//     text-align: center;
//     font-size: 14px;
//   }

//   th {
//     background-color: #f2f2f2; /* 헤더는 연회색 */
//   }

//   tr:nth-child(even) {
//     background-color: #fafafa; /* 짝수행 연한 회색 */
//   }

//   tr:hover {
//     background-color: #e6e6e6; /* hover 시 회색 강조 */
//   }
// `;


// import PropTypes from "prop-types";
// import styled from "styled-components";

// const ScoreBoard = ({ data }) => {
//   // 최신 점수 기준 내림차순 정렬
//   const sortedData = data
//     .map(({ id, scores }) => ({
//       id,
//       latestScore: scores[scores.length - 1]?.value ?? 0,
//     }))
//     .sort((a, b) => b.latestScore - a.latestScore);

//   const top3 = sortedData.slice(0, 3);
//   const rest = sortedData.slice(3, 8); // 4~8등

//   const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 1,2,3 순위 색
//   const cardSizes = ["180px", "150px", "150px"]; // 1등 크게, 2/3등 작게

//   return (
//     <Wrapper>
//       {/* Top 3 카드 */}
//       <Top3Container>
//         {/* 2등 */}
//         {top3[1] && (
//           <TopCard
//             style={{
//               borderColor: rankColors[1],
//               width: cardSizes[1],
//               height: cardSizes[1],
//             }}
//           >
//             <PlayerID>{top3[1].id}</PlayerID>
//             <PlayerScore>{top3[1].latestScore}</PlayerScore>
//             <RankText>2등</RankText>
//           </TopCard>
//         )}

//         {/* 1등 */}
//         {top3[0] && (
//           <TopCard
//             style={{
//               borderColor: rankColors[0],
//               width: cardSizes[0],
//               height: cardSizes[0],
//             }}
//           >
//             <PlayerID>{top3[0].id}</PlayerID>
//             <PlayerScore>{top3[0].latestScore}</PlayerScore>
//             <RankText>1등</RankText>
//           </TopCard>
//         )}

//         {/* 3등 */}
//         {top3[2] && (
//           <TopCard
//             style={{
//               borderColor: rankColors[2],
//               width: cardSizes[2],
//               height: cardSizes[2],
//             }}
//           >
//             <PlayerID>{top3[2].id}</PlayerID>
//             <PlayerScore>{top3[2].latestScore}</PlayerScore>
//             <RankText>3등</RankText>
//           </TopCard>
//         )}
//       </Top3Container>
//     </Wrapper>
//   );
// };

// ScoreBoard.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       scores: PropTypes.arrayOf(
//         PropTypes.shape({
//           time: PropTypes.string.isRequired,
//           value: PropTypes.number.isRequired,
//         })
//       ).isRequired,
//     })
//   ).isRequired,
// };

// export default ScoreBoard;

// /* --- Styled Components --- */
// const Wrapper = styled.div`
//   all: unset;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 30px;
//   min-height: 100vh;
//   // background-color: #f4f6fa; /* 전체 화면 배경 색 */
// `;

// const Top3Container = styled.div`
//   all: unset;
//   display: flex;
//   justify-content: center;
//   align-items: flex-end; /* 1등 카드가 중앙 높게 */
//   gap: 20px;
// `;

// const TopCard = styled.div`
//   all: unset;
//   padding: 20px;
//   border: 3px solid;
//   border-radius: 12px;
//   background-color: #ffffff;
//   text-align: center;
//   color: #333;

//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
// `;

// const PlayerID = styled.div`
//   font-weight: bold;
//   font-size: 18px;
//   margin-bottom: 10px;
// `;

// const PlayerScore = styled.div`
//   font-size: 24px;
//   font-weight: bold;
// `;

// /* 하단 순위 숫자용 */
// const RankText = styled.div`
//   all: unset;
//   font-size: 20px;
//   font-weight: bold;
//   color: #000; /* TOP3 카드 글자 색과 분리 */
//   margin-top: 10px;
//   text-align: center;
// `;

import PropTypes from "prop-types";
import "./ScoreRank.css"; // 새 CSS 파일 불러오기

const ScoreRank = ({ data }) => {
  // 최신 점수 기준 내림차순 정렬
  const sortedData = data
    .map(({ id, scores }) => ({
      id,
      latestScore: scores[scores.length - 1]?.value ?? 0,
    }))
    .sort((a, b) => b.latestScore - a.latestScore);

  const top3 = sortedData.slice(0, 3);

  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 1,2,3 순위 색
  const cardSizes = ["180px", "150px", "150px"]; // 1등 크게, 2/3등 작게

  return (
    <div className="Wrapper">
      {/* Top 3 카드 */}
      <div className="Top3Container">
        {/* 2등 */}
        {top3[1] && (
          <div
            className="TopCard"
            style={{
              borderColor: rankColors[1],
              width: cardSizes[1],
              height: cardSizes[1],
            }}
          >
            <div className="PlayerID">{top3[1].id}</div>
            <div className="PlayerScore">{top3[1].latestScore}</div>
            <div className="RankText">2등</div>
          </div>
        )}

        {/* 1등 */}
        {top3[0] && (
          <div
            className="TopCard"
            style={{
              borderColor: rankColors[0],
              width: cardSizes[0],
              height: cardSizes[0],
            }}
          >
            <div className="PlayerID">{top3[0].id}</div>
            <div className="PlayerScore">{top3[0].latestScore}</div>
            <div className="RankText">1등</div>
          </div>
        )}

        {/* 3등 */}
        {top3[2] && (
          <div
            className="TopCard"
            style={{
              borderColor: rankColors[2],
              width: cardSizes[2],
              height: cardSizes[2],
            }}
          >
            <div className="PlayerID">{top3[2].id}</div>
            <div className="PlayerScore">{top3[2].latestScore}</div>
            <div className="RankText">3등</div>
          </div>
        )}
      </div>
    </div>
  );
};

ScoreRank.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      scores: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.string.isRequired,
          value: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default ScoreRank;
