import styled from "styled-components";
import GoogleMeetIcon from "../../../assets/images/google_meet.svg";

const GoogleMeetBox = styled.div`
  flex: 1;
`;

const GoogleMeetIconBox = styled.img`
  height: 2.5rem;
`;

export const GoogleMeet = () => {
  return (
    <GoogleMeetBox>
      <GoogleMeetIconBox src={GoogleMeetIcon} />
    </GoogleMeetBox>
  );
};
