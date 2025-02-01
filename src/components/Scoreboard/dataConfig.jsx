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
        id: 'user1',
        scores: [400, 800, 900, 1200, 1300, 1400, 1500],
        color: 'rgba(255, 99, 132, 1)',
      },
      {
        id: 'user2',
        scores: [200, 600, 1000, 1100, 1200, 1200, 1200],
        color: 'rgba(54, 162, 235, 1)',
      },
      {
        id: 'user3',
        scores: [300, 400, 500, 700, 1100, 1400, 1500],
        color: 'rgba(255, 206, 86, 1)',
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
