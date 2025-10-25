// src/components/SevenSegment.jsx
import './SevenSegment.css';

// 각 숫자에 해당하는 세그먼트 (a, b, c, d, e, f, g)
const SEGMENTS = {
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
};

function SevenSegment({ digit, color = 'orange', size = 'normal', urgent = false }) {
  const segments = SEGMENTS[String(digit)] || [0, 0, 0, 0, 0, 0, 0];

  return (
    <div className={`seven-segment ${size} ${urgent ? 'urgent' : ''}`} data-color={color}>
      {/* 상단 (a) */}
      <div className={`segment segment-a ${segments[0] ? 'active' : ''}`}></div>

      {/* 우측 상단 (b) */}
      <div className={`segment segment-b ${segments[1] ? 'active' : ''}`}></div>

      {/* 우측 하단 (c) */}
      <div className={`segment segment-c ${segments[2] ? 'active' : ''}`}></div>

      {/* 하단 (d) */}
      <div className={`segment segment-d ${segments[3] ? 'active' : ''}`}></div>

      {/* 좌측 하단 (e) */}
      <div className={`segment segment-e ${segments[4] ? 'active' : ''}`}></div>

      {/* 좌측 상단 (f) */}
      <div className={`segment segment-f ${segments[5] ? 'active' : ''}`}></div>

      {/* 중앙 (g) */}
      <div className={`segment segment-g ${segments[6] ? 'active' : ''}`}></div>
    </div>
  );
}

export default SevenSegment;
