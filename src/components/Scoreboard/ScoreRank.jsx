import PropTypes from "prop-types";
import { memo } from "react";
import "./ScoreRank.css";
import rank1 from "/public/assets/Ranking/First_place.svg";
import rank2 from "/public/assets/Ranking/Second_place.svg";
import rank3 from "/public/assets/Ranking/Third_place.svg";

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
  const rankImages = [rank1, rank2, rank3];

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
            <img src={rankImages[1]} alt="2등" className="RankImage" />
            <div className="OverlayText">
              <div className="PlayerID">{top3[1].id}</div>
              <div className="PlayerScore">{top3[1].latestScore}</div>
            </div>
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
            <img src={rankImages[0]} alt="1등" className="RankImage" />
            <div className="OverlayText">
              <div className="PlayerID">{top3[0].id}</div>
              <div className="PlayerScore">{top3[0].latestScore}</div>
            </div>
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
            <img src={rankImages[2]} alt="3등" className="RankImage" />
            <div className="OverlayText">
              <div className="PlayerID">{top3[2].id}</div>
              <div className="PlayerScore">{top3[2].latestScore}</div>
            </div>
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

export default memo(ScoreRank);
