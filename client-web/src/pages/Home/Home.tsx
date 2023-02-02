import styled from "styled-components";
import { HomeContent } from "../../components/Home/HomeContent/HomeContent";
import { HomeHeader } from "../../components/Home/HomeHeader/HomeHeader";

const HomeBox = styled.div`
  min-height: 100%;
  height: auto;
  position: relative;
`;

export default function Home() {
  return (
    <HomeBox>
      <HomeHeader />
      <HomeContent />
    </HomeBox>
  );
}
