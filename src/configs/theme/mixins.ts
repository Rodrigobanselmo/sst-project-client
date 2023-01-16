const customMixinsIndex = {
  loadingFeedback: 1500,
  saveFeedback: 997,
  mouseControl: 999,
  popper: 1300,
  nodeLabel: 11,
  nodeCard: 10,
  sidebarTree: 998,
  // MODAL: 1300,
};

const customMixinsSize = {
  closedSideBarWidth: '4rem',
  openSideBarWidth: '16rem',
};

const customMixins = { ...customMixinsSize, ...customMixinsIndex };

export default customMixins;
