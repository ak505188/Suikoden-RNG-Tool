import withSizes from 'react-sizes';

export const mapSizesToProps = ({ width }) => ({
  isMobile: width < 480,
});

export const withSizesHOC = component =>
  withSizes(mapSizesToProps)(component);
