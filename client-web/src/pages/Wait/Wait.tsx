import styled from "styled-components";
import { GoogleMeet } from "../../components/Wait/GoogleMeet/GoogleMeet";
import { Account } from "../../components/Wait/Account/Account";

const WaitHeader = styled.div`
  display: flex;
  min-height: 2.5rem;
  padding: 1rem 1rem 0 1rem;
  text-align: left;
`;

const WaitBody = styled.div`
  flex-grow: 1;
  display: flex;
  height: calc(100vh - 2.5rem);
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const ContentBox = styled.div`
  height: 540px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
`;

const BodyLeft = styled.div`
  height: 332px;
  display: flex;
  flex-direction: column;
  max-width: 764px;
`;

const BodyRight = styled.div`
  height: 540px;
  display: flex;
  flex: 0 0 448px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 1rem 1rem 1rem 0.5rem;
`;

const CameraBox = styled.div`
  border-radius: 8px;
  box-shadow: 0px 1px 2px 0px rgb(60 64 67 / 30%),
    0px 1px 3px 1px rgb(60 64 67 / 15%);
  margin: 1rem 0.5rem 1rem 1rem;
  width: 448px;
  height: 252px;
  background-color: black;
`;

const DescriptionBox = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;

const DescriptionTitle = styled.div`
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 2.25rem;
  box-sizing: border-box;
  overflow: hidden;
  padding: 0 1.5rem;
  text-align: center;
  text-overflow: ellipsis;
  -webkit-user-select: text;
  white-space: nowrap;
  width: 100%;
`;

const DescriptionSubTitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 448px;
`;

const JoinButton = styled.button`
  border-width: 0;
  box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
  background-color: #1a73e8;
  color: #fff;
  margin: 0 0.25rem 1rem;
  border-radius: 24px;
  height: 48px;
  padding: 0 24px;
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  font-size: 0.875rem;
  letter-spacing: 0.0107142857em;
  font-weight: 500;
`;

export default function Wait() {
  return (
    <>
      <WaitHeader>
        <GoogleMeet />
        <Account />
      </WaitHeader>
      <WaitBody>
        <ContentBox>
          <BodyLeft>
            <CameraBox></CameraBox>
          </BodyLeft>
          <BodyRight>
            <DescriptionBox>
              <DescriptionTitle>참여할 준비가 되셨나요?</DescriptionTitle>
              <DescriptionSubTitle>다른 참여자가 없습니다.</DescriptionSubTitle>
            </DescriptionBox>
            <JoinButton>지금 참여하기</JoinButton>
          </BodyRight>
        </ContentBox>
      </WaitBody>
    </>
  );
}
