import styled from "styled-components";
import AccountBorder from "../../assets/images/account_border.svg";
import ProfileImageIcon from "../../assets/images/profile_image.jpg";

const ProfileBox = styled.div`
  width: 40px;
  height: 40px;
  position: relative;
  display: inline-block;
  vertical-align: middle;
`;

const ProfileImageBorder = styled.div`
  position: absolute;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: block;
  position: relative;
  overflow-clip-margin: content-box;
  overflow: clip;
  margin: 4px auto 0 auto;
`;

export const Profile = () => {
  return (
    <ProfileBox>
      <ProfileImageBorder>
        <img src={AccountBorder} />
      </ProfileImageBorder>
      <ProfileImage src={ProfileImageIcon} />
    </ProfileBox>
  );
};
