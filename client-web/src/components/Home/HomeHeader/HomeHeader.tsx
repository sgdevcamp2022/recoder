import styled from "styled-components";
import { GoogleAccount } from "../GoogleAccount/GoogleAccount";
import { GoogleMeet } from "../GoogleMeet/GoogleMeet";
import { HeaderInfo } from "../HeaderInfo/HeaderInfo";

const Header = styled.header`
  min-width: 320px;
  height: 64px;
`;

const HeaderBox = styled.div`
  padding: 8px;
  min-width: 0;
  position: relative;
  display: flex;
  // width: 100%;
  justify-content: space-between;
`;

export const HomeHeader = () => {
  return (
    <Header>
      <HeaderBox>
        <GoogleMeet />
        <HeaderInfo />
        <GoogleAccount />
      </HeaderBox>
    </Header>
  );
};
