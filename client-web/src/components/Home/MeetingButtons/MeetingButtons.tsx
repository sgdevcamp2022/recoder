import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useGetLinkQuery } from "../../../redux/apis/linkAPI";

const ButtonBox = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const HostButtonBox = styled.div`
  position: relative;
  overflow: visible;
  display: block;
`;

const HostButton = styled.button`
  background-color: #1a73e8;
  color: #fff;
  font-size: 1rem;
  padding: 0 16px 0 12px;
  box-shadow: none;
  height: 3em;
  margin: 6px 1.5em 1em 0;
  outline: 1px solid transparent;
  font-weight: 500;
  border-radius: 4px;
  display: inline-flex;
  position: relative;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  border: 0;
`;

const JoinButtonBox = styled.div`
  width: 100%;
  display: inline-flex;
  flex: 1 1 12em;
  min-width: 17em;
`;

const JoinLabel = styled.label`
  padding: 0 16px;
  height: 48px;
  border-radius: 4px;
  display: inline-flex;
  position: relative;
  align-items: baseline;
  margin-top: 0.375rem;
  width: 100%;
`;

const SpanBox = styled.span`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  text-align: left;
`;

const LeftSpan = styled.span`
  border-color: #80868b;
  width: 12px;
  height: 100%;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-left: 1px solid;
  border-right: none;
  border-top: 1px solid;
  border-bottom: 1px solid;
`;

const RightSpan = styled.span`
  border-color: #80868b;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  border-left: none;
  border-right: 1px solid;
  border-top: 1px solid;
  border-bottom: 1px solid;
  flex-grow: 1;
  height: 100%;
`;

const JoinInput = styled.input`
  color: #3c4043;
  caret-color: #1a73e8;
  font-size: 1rem;
  font-weight: 400;
  display: flex;
  border: none;
  height: 100%;
  padding: 0;
`;

export const MeetingButtons = () => {
  const [roomId, setRoomId] = useState<string>("");
  const { data } = useGetLinkQuery({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      window.location.href = `/${roomId}/`;
    }
  };

  return (
    <ButtonBox>
      <HostButtonBox>
        <HostButton
          onClick={(e) => {
            window.location.href = `/${data.link.split("/").pop()}/`;
          }}
        >
          새 회의
          {/* <Link onCto={`/${data.link.split("/").pop()}/`}>새 회의</Link> */}
        </HostButton>
      </HostButtonBox>
      <JoinButtonBox>
        <JoinLabel>
          <SpanBox>
            <LeftSpan />
            <RightSpan />
          </SpanBox>
          <JoinInput
            type="text"
            placeholder="코드 또는 링크 입력"
            onChange={handleChange}
            onKeyPress={handleKeyDown}
            value={roomId}
          />
        </JoinLabel>
      </JoinButtonBox>
    </ButtonBox>
  );
};
