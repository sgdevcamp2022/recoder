import styled from "styled-components";
import { MeetingButtons } from "../MeetingButtons/MeetingButtons";
import ArrowLeft from "../../../assets/images/left_arrow.svg";
import ArrowRight from "../../../assets/images/right_arrow.svg";
import DescriptionIcon from "../../../assets/images/description_image_1.svg";

const ContentBox = styled.div`
  height: calc(100vh - 64px);
  width: 100%;
  overflow-y: auto;
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
`;

const ContentLeftBox = styled.div`
  display: inline-flex;
  flex-direction: column;
  flex-basis: 35rem;
  flex-shrink: 1;
  max-width: 35rem;
  padding: 1em 3em;
`;

const Title = styled.div`
  font-size: 2.75rem;
  font-weight: 400;
  line-height: 3.25rem;
  letter-spacing: 0;
  padding-bottom: 0.5em;
`;

const SubTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0;
  padding-bottom: 3rem;
  max-width: 30rem;
  color: #5f6368;
`;

const HorizontalLine = styled.div`
  margin-top: 1em;
  border-bottom: 1px solid #dadce0;
  align-self: stretch;
  max-width: 42rem;
`;

const Helps = styled.div`
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  letter-spacing: 0;
  padding-top: 1.5em;
`;

const ContentRightBox = styled.div`
  display: inline-flex;
  flex-direction: column;
  flex-basis: 45%;
  overflow: hidden;
  max-width: 35rem;
  padding: 1.5em 3em;
  text-align: center;
`;

const DescriptionBox = styled.div`
  justify-content: center;
  display: flex;
`;

const Description = styled.div`
  width: 20.625rem;
`;

const DescriptionImage = styled.img`
  width: 20.625rem;
  height: 20.625rem;
`;

const DescriptionTitle = styled.div`
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 400;
  letter-spacing: 0;
  margin-top: 0.75rem;
`;

const DescriptionSubtitle = styled.div`
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.0142857143;
`;

const ArrowButton = styled.button`
  width: 48px;
  height: 48px;
  padding: 12px;
  font-size: 24px;
  background-color: transparent;
  border: none;
  outline: none;
  margin-top: 8.8125rem;
`;

const Dots = styled.div`
  margin-top: 0.5rem;
`;

const Dot = styled.div`
  width: 0.375rem;
  height: 0.375rem;
  margin: 0 0.25rem;
  display: inline-block;
  border-radius: 50%;
  background-color: #dadce0;
`;

export const HomeContent = () => {
  return (
    <ContentBox>
      <ContentLeftBox>
        <Title>
          ???????????? ?????? ????????? ?????? ????????? ????????? ????????? ??? ????????????
        </Title>
        <SubTitle>
          ????????? ???????????? ????????? ?????? Google Meet ???????????? ????????? ????????? ?????????
          ??? ????????? ?????? ??????????????????.
        </SubTitle>
        <MeetingButtons />
        <HorizontalLine />
        <Helps>
          Google Meet??? ??????{" "}
          <span style={{ color: "#1a73e8" }}>????????? ???????????????</span>
        </Helps>
      </ContentLeftBox>
      <ContentRightBox>
        <DescriptionBox>
          <span>
            <ArrowButton>
              <img src={ArrowLeft} alt="" />
            </ArrowButton>
          </span>
          <Description>
            <DescriptionImage src={DescriptionIcon} />
            <DescriptionTitle>?????? ?????? ??????</DescriptionTitle>
            <DescriptionSubtitle>
              Google Calendar?????? ????????? ???????????? ??????????????? ???????????? ????????????{" "}
              <strong>??? ??????</strong>??? ???????????????.
            </DescriptionSubtitle>
          </Description>
          <span>
            <ArrowButton>
              <img src={ArrowRight} alt="" />
            </ArrowButton>
          </span>
        </DescriptionBox>
        <Dots>
          <Dot />
          <Dot />
          <Dot />
        </Dots>
      </ContentRightBox>
    </ContentBox>
  );
};
