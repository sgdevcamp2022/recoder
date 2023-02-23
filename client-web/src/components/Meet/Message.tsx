import styled from "styled-components";

const MessageBox = styled.div`
  padding: 12px 24px;
  color: rgb(32, 33, 36);
  font-size: 13px;
`;

const PeerName = styled.div``;

const Content = styled.div``;

export const Message = ({ peer, message, myName }: any) => {
  return (
    <MessageBox>
      <PeerName>{peer === myName ? "나" : peer}</PeerName>
      <Content>{message}</Content>
    </MessageBox>
  );
};
