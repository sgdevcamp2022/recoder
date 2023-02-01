import styled from "styled-components";
import GoogleIcon from "../../../assets/images/google_icon.png";

const GoogleMeetBox = styled.div`
  flex: 1 1 auto;
  overflow: hidden;
  padding-right: 30px;
  box-sizing: border-box;
  height: 48px;
  vertical-align: middle;
  white-space: nowrap;
  align-items: center;
  display: flex;
  padding-left: 12px;
  position: relative;
`;

const MeetImage = styled.img`
  width: 124px;
  height: 40px;
  vertical-align: middle;
`;

const MeetText = styled.span`
  font-size: 22px;
  line-height: 24px;
  vertical-align: middle;
  position: relative;
  top: -1.5px;
  padding-left: 4px;
  color: #5f6368;
`;

export const GoogleMeet = () => {
  return (
    <GoogleMeetBox>
      <MeetImage src={GoogleIcon} />
      <MeetText>Meet</MeetText>
    </GoogleMeetBox>
  );
};
