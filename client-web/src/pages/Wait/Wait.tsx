import styled from "styled-components";
import { GoogleMeet } from "../../components/Wait/GoogleMeet/GoogleMeet";
import { Account } from "../../components/Wait/Account/Account";

const WaitHeader = styled.div`
  display: flex;
  min-height: 2.5rem;
  padding: 1rem 1rem 0 1rem;
  text-align: left;
`;

export default function Wait() {
  return (
    <WaitHeader>
      <GoogleMeet />
      <Account />
    </WaitHeader>
  );
}
