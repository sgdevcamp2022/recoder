import styled from "styled-components";

const DateTimeBox = styled.div`
  display: table-cell;
  vertical-align: middle;
  height: 48px;
  text-align: initial;
  line-height: 1.5rem;
  font-size: 1.125rem;
  font-weight: 400;
  margin-right: 0.75rem;
  margin-right: 12px;
  color: rgb(95, 99, 104);
`;

export default function DateTime() {
  return (
    <DateTimeBox>
      <span>오후 7:12</span>
      <span> • </span>
      <span>1월 24일 (화)</span>
    </DateTimeBox>
  );
}
