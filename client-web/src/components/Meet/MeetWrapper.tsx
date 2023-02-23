import styled from "styled-components";

export const MeetBox = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgb(32, 33, 36);
`;

export const MeetContent = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const VideoBox = styled.div`
  flex-grow: 1;
`;

export const MessageBox = styled.div`
  width: 360px;
  background-color: white;
  margin: 16px 16px 0 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
`;

export const MessageTitleBox = styled.div`
  height: 64px;
  padding-left: 24px;
  display: flex;
  align-items: center;
`;

export const MessageTitle = styled.div`
  flex-grow: 1;
  font-size: 18px;
`;

export const MessageCloseButton = styled.button`
  margin-right: 4px;
  height: 48px;
  width: 48px;
  padding: 12px;
  border: none;
  background-color: transparent;
  border-radius: 50%;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export const MessageContentBox = styled.div`
  flex-grow: 1;
`;

export const MessageInputBox = styled.div`
  min-height: 36px;
  margin: 15px;
  display: flex;
  align-items: center;
  background-color: rgb(241, 243, 244);
  border-radius: 25px;
  box-sizing: border-box;
  vertical-align: middle;
`;

export const MessageInput = styled.textarea`
  min-height: 28px;
  height: auto;
  overflow-y: auto;
  flex-grow: 1;
  border: none;
  background-color: transparent;
  padding: 12px 16px;
  font-size: 0.8125rem;
  line-height: 1.5rem;
  letter-spacing: 0.00625em;
  resize: none;
  font-weight: 400;
  outline: none;
`;

export const MessageSendButton = styled.button`
  height: 48px;
  width: 48px;
  color: rgb(26, 115, 232);
  padding: 12px;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  &:hover {
    background-color: #e8eaea;
  }
`;

export const MeetBottomTab = styled.div`
  height: 80px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
`;

export const InfoBox = styled.div`
  display: flex;
  flex: 1 1 25%;
  justify-content: flex-start;
  align-items: center;
  margin-left: 12px;
  color: white;
  font-size: 16px;
  font-family: "Google Sans", Roboto, Arial, sans-serif;
  font-weight: 500;
`;

export const MeetButtonBox = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 12px;
  flex: 1 1 25%;
  justify-content: center;
  align-items: center;
`;

export const OtherButtonBox = styled.div`
  display: flex;
  flex: 1 1 25%;
  justify-content: flex-end;
  align-items: center;
  margin-right: 18px;
`;

export const TimeText = styled.span`
  margin: 0 0.75rem;
`;

export const Seperator = styled.div`
  height: 1rem;
  border-left: 1px solid rgb(218, 220, 224);
`;

export const RoomText = styled.div`
  margin: 0 12px;
  // height: 5rem;
`;

export const GrayButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  padding: 8.5px 8px;
  background-color: rgb(60, 64, 67);
  border-color: transparent;
  border-width: 0px;
  border-radius: 100%;
  &:hover {
    background-color: #44474a;
  }
`;

export const RedButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  color: white;
  padding: 8.5px 8px;
  background-color: #ea4334;
  border-color: transparent;
  border-width: 0px;
  border-radius: 100%;
`;

export const BlueButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  color: black;
  padding: 8.5px 8px;
  background-color: #8ab4f8;
  border-color: transparent;
  border-width: 0px;
  border-radius: 100%;
  &:hover {
    background-color: #9cc0f9;
  }
`;

export const RedLongButton = styled.button`
  width: 3.5rem;
  height: 2.5rem;
  border-radius: 100px;
  border-width: 0px;
  color: white;
  padding: 8px 12px;
  background-color: rgb(234, 67, 53);
  &:hover {
    background-color: #ea5043;
  }
`;

export const CommonButton = styled.button`
  width: 48px;
  height: 48px;
  color: white;
  padding: 12px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  &:hover {
    background-color: #28292c;
  }
`;
