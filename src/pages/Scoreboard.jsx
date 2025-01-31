import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactPaginate from 'react-paginate';

function Scoreboard() {
  const scores = [
    { id: 'aaaaa1234', score: 1500 },
    { id: 'aaaaa5678', score: 750 },
    { id: 'aaaaa4949', score: 1200 },
    { id: 'aaaaa2121', score: 500 },
  ];

  const scoresPerPage = 10;
  const [pageNumber, setPageNumber] = useState(0);
  const pagesVisited = pageNumber * scoresPerPage;
  const pageCount = Math.ceil(scores.length / scoresPerPage);

  const displayScores = scores
    .slice(pagesVisited, pagesVisited + scoresPerPage)
    .map((score, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>
          <img
            src='/placeholder.png'
            alt='Rank'
            style={{ width: '30px', height: '30px' }}
          />
        </td>
        <td>{score.id.replace(/.(?=.{3})/g, '*')}</td>
        <td>{score.score}</td>
      </tr>
    ));

  for (let i = displayScores.length; i < scoresPerPage; i++) {
    displayScores.push(
      <tr key={`empty-${i}`}>
        <td>{i + 1}</td>
        <td>----</td>
        <td>----</td>
        <td>----</td>
      </tr>
    );
  }

  const changePage = ({ selected }) => setPageNumber(selected);

  return (
    <ScoreboardWrapper>
      <Title>Scoreboard</Title>
      <Table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Icon</th>
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
    </ScoreboardWrapper>
  );
}

export default Scoreboard;

const glow = keyframes`
  0%, 100% {
    text-shadow: 0 0 10px #8cff66, 0 0 20px #8cff66, 0 0 30px #8cff66, 0 0 40px #8cff66, 0 0 50px #8cff66, 0 0 60px #8cff66, 0 0 70px #8cff66;
  }
  50% {
    text-shadow: 0 0 20px #8cff66, 0 0 30px #8cff66, 0 0 40px #8cff66, 0 0 50px #8cff66, 0 0 60px #8cff66, 0 0 70px #8cff66, 0 0 80px #8cff66;
  }
`;

const ScoreboardWrapper = styled.div`
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
  animation: ${glow} 2s ease-in-out infinite;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  min-width: 600px;

  th,
  td {
    border: 1px solid #333;
    padding: 10px;
    text-align: center;
    color: #fff;
    background-color: #222;
    transition: background-color 0.3s;
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
  cursor: pointer;

  .paginationBttns {
    display: flex;
    list-style: none;
    padding: 0;
    gap: 8px;
    font-size: 16px;
    animation: ${glow} 2s ease-in-out infinite;
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

  .paginationActive {
    border: 1px solid #8cff66;
    background-color: #333;
    color: #fff;
    padding: 0 10px;
  }

  .paginationDisabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: #666;
  }
`;
