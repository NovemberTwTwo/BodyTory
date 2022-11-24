import Input from "@components/Input";

import { NextPage } from "next";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import customApi from "utils/client/customApi";
import { useMutation } from "@tanstack/react-query";
import { HelpForm } from "./find-pw";
import { HELP_FIND_ID } from "constant/queryKeys";
import useReset from "@hooks/useReset";
import { RoundButton } from "@components/button/Button";
import { theme } from "@styles/theme";
import { EMAIL_REGEX } from "constant/regex";
import ButtonInInput from "@components/ButtonInInput";
import MessageBox from "@components/MessageBox";
import styled from "styled-components";
import { FlexContainer, InnerContainer } from "@styles/Common";

const HelpFindId: NextPage = () => {
  const router = useRouter();
  const { postApi } = customApi("/api/auth/help/find-id");
  const [currentComment, setCurrentComment] = useState("아이디를 잊으셨나요?\n가입 시 입력한 이메일을 알려주세요");
  const [foundAccountId, setFoundAccountId] = useState("");
  const { mutate } = useMutation([HELP_FIND_ID], postApi, {
    onError(error: any) {
      console.log(error.data);
      if (isToken) {
        return setError("token", { message: `${error.data}` });
      }
      setError("email", { message: `가입된 이메일이 없어요\n다시 한번 확인해주세요` });
    },
    onSuccess(data) {
      if (isToken) {
        if (data.data) {
          return setFoundAccountId(`${data.data}`);
        }
        setValue("token", "");
        clearErrors();
        return setCurrentComment("입력하신 이메일로 한번 더 보냈어요!\n인증번호를 확인해주세요");
      }
      setIsToken(true);
      clearErrors();
      setCurrentComment("입력하신 이메일로 인증메일을 보냈어요!\n인증번호를 확인해주세요");
    },
  });
  const {
    register: helpRegister,
    handleSubmit: helpHandleSubmit,
    setValue,
    watch,
    setError,
    reset,
    clearErrors,
    formState: { errors: helpErrors },
  } = useForm<HelpForm>({ mode: "onChange" });
  const [isToken, setIsToken] = useState(false);
  const onValidHelpForm = (helpForm: HelpForm) => {
    console.log(helpForm);
    mutate(helpForm);
  };
  const handleClickFindId = () => {
    if (!watch("email")) return setError("email", { message: "이메일을 입력해주세요" });
    if (watch("email") && !EMAIL_REGEX.test(watch("email")!)) {
      return setError("email", { message: "이메일 형식에 맞지 않습니다" });
    }
    mutate({ email: watch("email") });
  };

  const isErrorsMessage = helpErrors.email?.message || helpErrors.token?.message;

  useEffect(() => {
    if (!isToken) {
      setCurrentComment("아이디를 잊으셨나요?\n가입 시 입력한 이메일을 알려주세요");
    }
  }, [isToken]);

  return (
    <Container>
      <InnerContainer>
        {!foundAccountId ? (
          <>
            <MessageBox isErrorsMessage={isErrorsMessage} currentComment={currentComment} />
            <form onSubmit={helpHandleSubmit(onValidHelpForm)}>
              <Seperation>
                {isToken ? (
                  <ButtonInInput
                    name="email"
                    register={helpRegister("email")}
                    error={helpErrors.email?.message}
                    isCertified={false}
                    changeButtonValue="이메일"
                    disabled
                    nonSubmit
                    isToken={isToken}
                    setIsToken={setIsToken}
                  />
                ) : (
                  <Input
                    name="email"
                    register={helpRegister("email", {
                      required: true,
                      validate: value => EMAIL_REGEX.test(value!) || "이메일 형식에 맞지 않습니다",
                    })}
                    placeholder="toritori2022@naver.com"
                    error={helpErrors.email?.message}
                  />
                )}
              </Seperation>
              <Seperation>
                <RoundButton size="lg" nonSubmit onClick={handleClickFindId}>
                  {isToken ? "인증메일 다시 보내기" : "아이디 찾기"}
                </RoundButton>
              </Seperation>
              <Seperation>
                {isToken && (
                  <ButtonInInput
                    name="token"
                    placeholder="인증번호"
                    register={helpRegister("token", {
                      required: "인증번호를 입력해주세요",
                      validate: value => /^[0-9]+$/.test(value!) || "숫자만 입력해주세요",
                    })}
                    buttonValue="인증번호 확인"
                    isAuthenticationColumn
                    error={helpErrors.token?.message}
                  />
                )}
              </Seperation>
            </form>
          </>
        ) : (
          <FinalCommentBox>
            <div className="innerBox">
              <MessageBox>
                <p>
                  이용자님의 아이디는 <strong>{foundAccountId}</strong> 입니다.
                </p>
              </MessageBox>
              <RoundButton size="lg" bgColor={theme.color.mintBtn}>
                <Link href="/auth/login">로그인하러 가기</Link>
              </RoundButton>
            </div>
          </FinalCommentBox>
        )}
      </InnerContainer>
    </Container>
  );
};
export default HelpFindId;

const Container = styled(FlexContainer)``;

const Seperation = styled.div`
  & + & {
    margin-top: 30px;
  }
`;

export const FinalCommentBox = styled.div`
  display: flex;
  justify-content: center;
  .innerBox {
    div {
      font-size: 36px;
      color: #fff;
      margin-bottom: 50px;
      strong {
        border-bottom: 2px solid #fff;
        margin: 0 30px;
      }
    }
    button {
      margin: 0 auto;
    }
  }
`;
