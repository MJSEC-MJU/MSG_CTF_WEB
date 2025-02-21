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

export const datasetsConfig = [
  {
    title: 'Individual Ranking',
    data: [
      {
        id: 1,
        userid: 'user1',
        totalPoint: 500,
        lastSolvedTime: '2025-02-13T23:37:38',
        univ: '',
      },
      {
        id: 2,
        userid: 'user2',
        totalPoint: 500,
        lastSolvedTime: '2025-02-14T01:23:37',
        univ: 'univ',
      },
    ],
  },
  {
    title: 'University Rankings',
    data: [
      {
        id: 'Myongji Univ.',
        scores: [500, 700, 850, 1100, 1250, 1350, 1450],
        color: 'rgba(75, 192, 192, 1)',
      },
      {
        id: 'Seoul Univ.',
        scores: [300, 550, 750, 950, 1150, 1250, 1300],
        color: 'rgba(153, 102, 255, 1)',
      },
      {
        id: 'Yonsei Univ.',
        scores: [400, 600, 850, 1050, 1200, 1400, 1500],
        color: 'rgba(255, 159, 64, 1)',
      },
    ],
  },
];
