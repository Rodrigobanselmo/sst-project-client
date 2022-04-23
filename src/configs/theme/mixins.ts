const customMixinsIndex = {
  loadingFeedback: 1001,
  saveFeedback: 997,
  mouseControl: 999,
  popper: 1000,
  nodeLabel: 11,
  nodeCard: 10,
  sidebarTree: 998,
};

const customMixinsSize = {
  closedSideBarWidth: '4rem',
  openSideBarWidth: '16rem',
};

const customMixins = { ...customMixinsSize, ...customMixinsIndex };

export default customMixins;
