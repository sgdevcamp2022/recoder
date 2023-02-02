import styled from "styled-components";
import ProfileIcon from "../../../assets/images/profile_image.jpg";

const AccountBox = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: flex-start;
`;

const AccountImage = styled.img`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  vertical-align: middle;
`;

const DescriptionBox = styled.div`
  margin-right: 0.75rem;
  text-align: right;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.875rem;
  line-height: 1rem;
`;

export const Account = () => {
  return (
    <AccountBox>
      <AccountImage src={ProfileIcon} />
      <DescriptionBox>
        <div>eunjong147@gmail.com</div>
        <div>계정 전환</div>
      </DescriptionBox>
    </AccountBox>
  );
};
