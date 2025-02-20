import { useState, useMemo } from 'react';
import styled from 'styled-components';
import ReactPaginate from 'react-paginate';

import BronzeIcon from '../assets/Ranking/BronzeIcon.svg';
import SilverIcon from '../assets/Ranking/SilverIcon.svg';
import GoldIcon from '../assets/Ranking/GoldIcon.svg';
import PlatinumIcon from '../assets/Ranking/PlatinumIcon.svg';
import DiamondIcon from '../assets/Ranking/DiamondIcon.svg';
import ChallengerIcon from '../assets/Ranking/ChallengerIcon.svg';

function Ranking() {
  const scores = useMemo(
    () =>
      [
        { id: 'aaaaa1234', score: 1500 },
        { id: 'aaaaa5678', score: 750 },
        { id: 'aaaaa4949', score: 1200 },
        { id: 'aaaaa2121', score: 500 },
        { id: 'aaaaa6789', score: 1700 },
        { id: 'aaaaa1111', score: 900 },
        { id: 'aaaaa2222', score: 1300 },
        { id: 'aaaaa3333', score: 1400 },
        { id: 'aaaaa4444', score: 1100 },
      ].sort((a, b) => b.score - a.score),
    []
  );

  const scoresPerPage = 10;
  const [pageNumber, setPageNumber] = useState(0);
  const pagesVisited = pageNumber * scoresPerPage;
  const pageCount = Math.ceil(scores.length / scoresPerPage);

  const getIconForRank = (rank) => {
    if (rank === 1) return ChallengerIcon;
    if (rank >= 2 && rank <= 3) return DiamondIcon;
    if (rank >= 4 && rank <= 7) return PlatinumIcon;
    if (rank >= 8 && rank <= 10) return GoldIcon;
    if (rank >= 11 && rank <= 15) return SilverIcon;
    return BronzeIcon;
  };

  const displayScores = useMemo(() => {
    const slicedScores = scores.slice(
      pagesVisited,
      pagesVisited + scoresPerPage
    );
    const rows = slicedScores.map((score, index) => {
      const rank = pagesVisited + index + 1;
      return (
        <tr key={score.id}>
          <td>{rank}</td>
          <td>
            <img
              src={getIconForRank(rank)}
              alt={`Rank ${rank}`}
              style={{ width: '30px', height: '30px' }}
            />
          </td>
          <td>{score.id.replace(/.(?=.{3})/g, '*')}</td>
          <td>{score.score}</td>
        </tr>
      );
    });

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
  }, [pageNumber, scores]);

  const changePage = ({ selected }) => setPageNumber(selected);

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
}

export default Ranking;

const RankingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0d0d0d;
  min-height: 100vh;
  width: 100%;
  padding: 20px;
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
