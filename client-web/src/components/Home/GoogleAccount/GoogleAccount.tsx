import styled from "styled-components";
import { CircleButton } from "../CircleButton/CircleButton";
import { Profile } from "../Profile/Profile";
import GoogleAppIcon from "../../../assets/images/google_app.svg";

const GoogleAccountBox = styled.div`
  position: relative;
  display: flex;
  line-height: normal;
  flex: 0 0 auto;
  justify-content: flex;
  align-items: center;
  margin-left: 16px;
`;

export const GoogleAccount = () => {
  return (
    <GoogleAccountBox>
      <CircleButton src={GoogleAppIcon} />
      <Profile />
    </GoogleAccountBox>
  );
};
