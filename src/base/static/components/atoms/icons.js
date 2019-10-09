// these components were generated with this command:
// npx @svgr/cli --icon twitter-icon.svg
import React from "react";
import PropTypes from "prop-types";

import SvgIcon from "@material-ui/core/SvgIcon";

const TwitterIconPath = ({ fill = "#1da1f2" }) => (
  <path
    d="M94.719 243.187c112.46 0 173.956-93.168 173.956-173.956 0-2.647-.054-5.28-.173-7.903A124.323 124.323 0 0 0 299 29.668c-10.955 4.87-22.744 8.147-35.11 9.625 12.623-7.569 22.314-19.543 26.885-33.817a122.61 122.61 0 0 1-38.824 14.84C240.794 8.433 224.911 1 207.322 1c-33.763 0-61.144 27.38-61.144 61.132 0 4.798.537 9.465 1.586 13.94C96.948 73.517 51.89 49.188 21.738 12.194a60.978 60.978 0 0 0-8.278 30.73c0 21.212 10.793 39.938 27.207 50.893a60.69 60.69 0 0 1-27.69-7.647c-.01.257-.01.507-.01.781 0 29.61 21.076 54.332 49.052 59.934a61.22 61.22 0 0 1-16.122 2.152c-3.934 0-7.766-.387-11.49-1.103C42.19 172.227 64.76 189.904 91.52 190.4c-20.925 16.402-47.287 26.17-75.937 26.17-4.929 0-9.798-.28-14.584-.846 27.059 17.344 59.19 27.464 93.722 27.464"
    fill={fill}
  />
);
const TwitterIcon = ({ fill, ...props }) => (
  <svg viewBox="0 0 300 244.187" width="1em" height="1em" {...props}>
    <TwitterIconPath fill={fill} />
  </svg>
);

const MuiTwitterIcon = ({ fill, ...props }) => (
  <SvgIcon viewBox="0 0 300 244.187" {...props}>
    <TwitterIconPath fill={fill} />
  </SvgIcon>
);

const FacebookFPath = ({ fill = "#fff" }) => (
  <path
    fill={fill}
    d="M182.409 262.307v-99.803h33.499l5.016-38.895h-38.515V98.777c0-11.261 3.127-18.935 19.275-18.935l20.596-.009V45.045c-3.562-.474-15.788-1.533-30.012-1.533-29.695 0-50.025 18.126-50.025 51.413v28.684h-33.585v38.895h33.585v99.803h40.166z"
  />
);

const FacebookPath = ({ outerFill = "#3C5A99", innerFill }) => (
  <React.Fragment>
    <path
      fill={outerFill}
      d="M248.082 262.307c7.854 0 14.223-6.369 14.223-14.225V18.812c0-7.857-6.368-14.224-14.223-14.224H18.812c-7.857 0-14.224 6.367-14.224 14.224v229.27c0 7.855 6.366 14.225 14.224 14.225h229.27z"
    />
    <FacebookFPath fill={innerFill} />
  </React.Fragment>
);
const FacebookIcon = props => (
  <svg viewBox="0 0 266.893 266.895" width="1em" height="1em" {...props}>
    <FacebookPath />
  </svg>
);

const MuiFacebookFIcon = ({ fill, ...props }) => (
  <SvgIcon viewBox="0 0 266.893 266.895" {...props}>
    <FacebookFPath fill={fill} />
  </SvgIcon>
);

const HeartIcon = props => (
  <svg viewBox="0 0 133.8 133.8" width="1em" height="1em" {...props}>
    <style>{`.st0{fill:#dd2424}`}</style>
    <g>
      <path
        className="st0"
        d="M41.9 100.7L11.8 70.6C-2 56.8-2 34.3 11.8 20.5c13.8-13.8 36.3-13.8 50.1 0L92 50.6c13.8 13.8 13.8 36.3 0 50.1-13.8 13.8-36.4 13.8-50.1 0z"
      />
      <path
        className="st0"
        d="M41.9 50.6L72 20.5c13.8-13.8 36.3-13.8 50.1 0 13.8 13.8 13.8 36.3 0 50.1L92 100.7c-13.8 13.8-36.3 13.8-50.1 0-13.8-13.8-13.8-36.3 0-50.1z"
      />
      <path
        className="st0"
        d="M63.4 122.2L36.6 95.4c-1.9-1.9-1.9-5.1 0-7.1l26.8-26.8c1.9-1.9 5.1-1.9 7.1 0l26.8 26.8c1.9 1.9 1.9 5.1 0 7.1l-26.8 26.8c-2 1.9-5.2 1.9-7.1 0z"
      />
    </g>
  </svg>
);

const CreatePolygonIcon = props => (
  <svg width="1.5rem" height="1.5rem" viewBox="0 0 75 75" {...props}>
    <path
      fill="none"
      stroke={props.color}
      strokeWidth={8}
      strokeMiterlimit={10}
      d="M16.3 15.6l30.4-.1 14 20.8-16.3 24.5-29.3.1 13.1-23.7z"
    />
    <circle fill={props.color} cx={16.5} cy={15} r={11} />
    <circle fill={props.color} cx={57.3} cy={37.3} r={11} />
    <circle fill={props.color} cx={16.4} cy={60.6} r={11} />
  </svg>
);

CreatePolygonIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

CreatePolygonIcon.defaultProps = {
  color: "#000",
};

const CreatePolylineIcon = props => (
  <svg width="1.5rem" height="1.5rem" viewBox="0 0 75 75" {...props}>
    <circle fill={props.color} cx={14.8} cy={15.9} r={11.7} />
    <circle fill={props.color} cx={58.5} cy={57.9} r={11.7} />
    <path
      fill="none"
      stroke={props.color}
      strokeWidth={8}
      strokeMiterlimit={10}
      d="M14.2 16l36.4 12.1 8.3 30.5"
    />
  </svg>
);

CreatePolylineIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

CreatePolylineIcon.defaultProps = {
  color: "#000",
};

const DeleteGeometryIcon = props => (
  <svg width="1.5rem" height="1.5rem" viewBox="0 0 75 75" {...props}>
    <path
      fill={props.color}
      d="M11.3 17.8l.2 6.5H16l3.1 45.4 35.7.2 3.1-45.7 4.8-.1v-6l-51.4-.3zm13.5 46l-2.4-39.6h5.1l.6 39.7-3.3-.1zm13.8 0h-3.2l-1-39.5h5.5l-1.3 39.5zm10.8.1h-3.5l.8-39.4h5.1l-2.4 39.4zM16.2 15.1l41.8.1.1-5.9-16.2-.1V4.9h-9.5V9l-16.2.1z"
    />
  </svg>
);

DeleteGeometryIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

DeleteGeometryIcon.defaultProps = {
  color: "#000",
};

const UndoIcon = props => (
  <svg width="1.5rem" height="1.5rem" viewBox="0 0 28.6 24.6" {...props}>
    <path
      fill={props.color}
      d="M20.5 21.6c-2.2 1.9-5 3.1-8.1 3.1C5.5 24.6 0 19.1 0 12.3 0 5.5 5.5 0 12.3 0c6.1 0 11.2 4.5 12.2 10.3h4.1l-6.3 7.6-6.2-7.7h4.3c-.9-3.6-4.2-6.2-8-6.2C7.7 4 4 7.7 4 12.3s3.7 8.3 8.3 8.3c2.2 0 4.2-.8 5.6-2.2l2.6 3.2z"
    />
  </svg>
);

UndoIcon.propTypes = {
  color: PropTypes.string.isRequired,
};

UndoIcon.defaultProps = {
  color: "#000",
};

const MuiGoogleIcon = ({ fill = "#000", ...props }) => (
  <SvgIcon viewBox="0 0 1000 1000" {...props}>
    <path
      d="M821.2 10H556c-69.5 0-157 10.3-230.4 70.7-55.4 47.6-82.4 113.2-82.4 172.3 0 100.3 77.2 201.9 213.7 201.9 12.9 0 27-1.3 41.2-2.6-6.4 15.4-12.9 28.2-12.9 50.1 0 39.9 20.6 64.3 38.6 87.4-57.9 3.8-166 10.3-245.9 59.1-76 45.1-99.2 110.6-99.2 157 0 95.2 90.1 184 276.8 184 221.4 0 338.6-122.2 338.6-243.2 0-88.7-51.5-132.5-108.2-180l-46.4-36c-14.1-11.6-33.4-27-33.4-55.3 0-28.3 19.3-46.3 36-63C696.2 370 750.3 325 750.3 229.8c0-97.8-61.8-149.2-91.4-173.6h79.9L821.2 10zM708 797c0 79.7-65.7 138.9-189.3 138.9-137.7 0-226.6-65.6-226.6-156.9 0-91.4 82.4-122.1 110.7-132.5 54.1-18 123.6-20.6 135.2-20.6 12.9 0 19.3 0 29.7 1.3C665.5 696.7 708 731.5 708 797zM605 382.9c-20.6 20.5-55.4 36-87.6 36-110.7 0-160.9-142.8-160.9-228.9 0-33.5 6.4-68.1 28.3-95.2 20.6-25.7 56.6-42.5 90.1-42.5 106.8 0 162.2 144 162.2 236.6.1 23.3-2.5 64.4-32.1 94z"
      fill={fill}
    />
  </SvgIcon>
);

MuiGoogleIcon.propTypes = {
  fill: PropTypes.string.isRequired,
};

const MuiDiscourseIcon = ({ fill, ...props }) => (
  <SvgIcon viewBox="0 0 448 512" {...props}>
    <path
      d="M225.9 32C103.3 32 0 130.5 0 252.1 0 256 .1 480 .1 480l225.8-.2c122.7 0 222.1-102.3 222.1-223.9C448 134.3 348.6 32 225.9 32zM224 384c-19.4 0-37.9-4.3-54.4-12.1L88.5 392l22.9-75c-9.8-18.1-15.4-38.9-15.4-61 0-70.7 57.3-128 128-128s128 57.3 128 128-57.3 128-128 128z"
      fill={fill}
    />
  </SvgIcon>
);

MuiDiscourseIcon.propTypes = {
  fill: PropTypes.string.isRequired,
};

const PlaceholderPicture = ({
  width = "100px",
  height = "70px",
  ...props
}) => (
  <svg width={width} height={height} viewBox="0 0 360 252" {...props}>
    <path
      fill="#F2F2F2"
      d="M360 243c0 5-4 9-9 9H9c-5 0-9-4-9-9V9c0-5 4-9 9-9h342c5 0 9 4 9 9v234z"
    />
    <g fill="#D8D8D8">
      <path d="M38.2 202.5V47.2c.1-.3.2-.5.3-.8 2.2-16 15.2-27.6 31.4-27.6h219.7c2.9 0 6 .4 8.8 1.2 13.6 3.9 22.8 16.1 22.8 30.2v148.9c0 14.8-9.8 27.4-24.1 30.9-2 .5-4.2.7-6.2 1H68.6c-.4-.1-.8-.2-1.3-.2-12.7-1-23.6-9.5-27.5-21.6-.7-2.1-1.1-4.4-1.6-6.7zm141.6 16.7H286c2.3 0 4.7-.2 7-.5 8.6-1.2 13.9-6.2 15.5-14.6.5-2.6.7-5.3.7-8V53.8c0-2.5-.2-5.1-.6-7.6-1.3-8.1-6.2-13.2-14.3-14.8-2.8-.5-5.6-.8-8.5-.8H73.3c-2.3 0-4.7.2-7 .5-8.5 1.2-13.8 5.9-15.6 14.3-.6 2.8-.8 5.7-.8 8.6v141.7c0 2.6.2 5.2.6 7.8 1.3 7.9 5.8 13.1 13.8 14.8 2.8.6 5.8.9 8.7.9h106.8z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M232.7 60.1c5.9 5.3 11.7 10.5 17.5 15.8 13.2 11.9 26.4 23.8 39.7 35.7 1.3 1.2 1.8 2.3 1.8 4.1-.1 28 0 56 0 84v1.9h-224v-1.5V150c0-.9.1-1.5.9-2.1 19.1-15.2 38.1-30.4 57.1-45.7.3-.2.6-.4 1-.7 9.8 7.8 19.6 15.7 29.4 23.5 25.6-21.7 51.1-43.3 76.6-64.9zM114.9 71.8c0 13-10.5 23.6-23.5 23.7-13 0-23.6-10.5-23.7-23.5 0-13 10.5-23.6 23.5-23.6 13.1-.1 23.6 10.4 23.7 23.4z"
      />
    </g>
  </svg>
);

export {
  TwitterIcon,
  MuiTwitterIcon,
  MuiGoogleIcon,
  MuiDiscourseIcon,
  FacebookIcon,
  MuiFacebookFIcon,
  HeartIcon,
  CreatePolygonIcon,
  CreatePolylineIcon,
  DeleteGeometryIcon,
  UndoIcon,
  PlaceholderPicture,
};
