import ManageImage from "@components/ManageImage";
import { RecordWithImageAndHospital } from "@components/records/chart/ChartTimeline";
import { Record, RecordImage } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import customApi from "@utils/client/customApi";
import {
  AI_RESULT_READ,
  BODYPART_CHARTDATA_READ,
  CHART_RECOMMEND_READ,
  KEYWORDS_CHARTDATA_READ,
  RECORDS_DELETE,
  RECORDS_READ,
  RECORDS_UPDATE,
} from "constant/queryKeys";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import styled, { css } from "styled-components";
import { ModalContainer, ModalWrapper, Dim } from "@styles/ModalStyled";
import { changeDate } from "@utils/client/changeDate";
import usePortal from "@hooks/usePortal";
import { RoundedDefaultButton } from "@components/layout/buttons/DefaultButtons";
import { media } from "@styles/theme";
export interface RecordWithImage extends Record {
  images: RecordImage[];
}

interface RecordUpdateType {
  updateWrite: string;
}
interface RecordModalProps {
  record: RecordWithImageAndHospital;
  isHospital: boolean;
  onClose: () => void;
  setShowAlertModal: React.Dispatch<React.SetStateAction<boolean>>
}
const RecordModal = ({ onClose, record, isHospital, setShowAlertModal }: RecordModalProps) => {
  const { putApi, deleteApi } = customApi("/api/users/records");
  const Portal = usePortal();

  const queryClient = useQueryClient();

  const deleteMutate = useMutation([RECORDS_DELETE], deleteApi, {
    onSuccess() {
      queryClient.invalidateQueries([RECORDS_READ]);
      queryClient.invalidateQueries([AI_RESULT_READ]);
      queryClient.invalidateQueries([BODYPART_CHARTDATA_READ]);
      queryClient.invalidateQueries([KEYWORDS_CHARTDATA_READ]);
      queryClient.invalidateQueries([CHART_RECOMMEND_READ]);
      onClose();
    },
  });

  const updateMutate = useMutation([RECORDS_UPDATE], putApi, {
    onSuccess(data, variables, context) {
      queryClient.invalidateQueries([RECORDS_READ]);
      queryClient.invalidateQueries([AI_RESULT_READ]);
      queryClient.invalidateQueries([BODYPART_CHARTDATA_READ]);
      queryClient.invalidateQueries([KEYWORDS_CHARTDATA_READ]);
      queryClient.invalidateQueries([CHART_RECOMMEND_READ]);
    },
  });

  // 기록 삭제
  const [confirmDelete, setConfirmDelete] = useState(-1);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, recordId: number) => {
    if (confirmDelete !== -1) {
      deleteMutate.mutate({ id: confirmDelete });
      setShowAlertModal(true);
    } else {
      setConfirmDelete(recordId);
    }
  };

  // 기록 수정
  const [textArea, setTextArea] = useState<string | undefined>(record!.description);
  const [showMsg, setShowMsg] = useState<boolean>(false);
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextArea(e.target.value);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordUpdateType>({
    reValidateMode: "onSubmit",
  });

  const onValid: SubmitHandler<RecordUpdateType> = ({ updateWrite }) => {
    setShowMsg(true);
    updateMutate.mutate({ id: record.id, position: record!.position, description: updateWrite });
    setTimeout(() => {
      setShowMsg(false);
    }, 1400);
  };

  const modalContent = (
    <ModalWrapper>
      <Dim onClick={onClose} />
      <ModalContainer width="800px" height="auto">
        <ScrollContainer>
          <RecordDetailContainer>
            {isHospital || (
              <ButtonBox>
                <CircleDeleteButton
                  onClick={e => handleClick(e, record!.id)}
                  recordId={record!.id}
                  className={confirmDelete === record!.id ? "active" : ""}
                  onBlur={() => setConfirmDelete(-1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                  </svg>
                  <span>삭제하시겠습니까?</span>
                </CircleDeleteButton>
                <ModalButton
                  onClick={onClose}
                  sm
                  bgColor="rgb(198,205,250)"
                  color="#5D6BB2"
                >
                  닫기
                </ModalButton>
              </ButtonBox>
            )}
            <Time byUser={record!.type === "user"}>{changeDate(record!.createAt)}</Time>
            <EditTextBox onSubmit={handleSubmit(onValid)}>
              <TextArea
                {...register("updateWrite", {
                  required: "증상을 입력해주세요",
                })}
                onChange={handleTextChange}
                onFocus={() => setShowMsg(false)}
                disabled={isHospital}
                value={textArea}
              />
              {isHospital || (
                <div className="buttonBox">
                  <ModalButton sm bgColor="rgb(83,89,233)" >
                    수정하기
                  </ModalButton>
                </div>
              )}
              {showMsg && <SuccessMsg>수정이 완료되었습니다!</SuccessMsg>}
              {errors.updateWrite && <ErrorMsg>{errors.updateWrite.message}</ErrorMsg>}
            </EditTextBox>
            <ManageImage recordId={record.id} recordImages={record.images} isHospital={isHospital} />
          </RecordDetailContainer>
          {isHospital && (
            <HospitalModalCloseButtonBox>
              <ModalButton
                onClick={onClose}
                sm
                bgColor="rgb(198,205,250)"
                color="#5D6BB2"
              >
                닫기
              </ModalButton>
            </HospitalModalCloseButtonBox>
          )}
        </ScrollContainer>
      </ModalContainer>
    </ModalWrapper>
  );
  return Portal({ children: modalContent });
};

export default RecordModal;


export const ModalButton = styled(RoundedDefaultButton)`
  width: auto;
  padding: 12px 30px;
`;

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const RecordDetailContainer = styled.div`
  padding: 30px 40px 60px 70px;
  ${media.tablet}{
    padding: 30px 20px 30px 30px;
  }
`;

const Time = styled.div<{ byUser: boolean }>`
  position: relative;
  padding: 10px;
  margin-bottom: 10px;
  font-size: 16px;

  &:after {
    content: "";
    position: absolute;
    top: calc(10px + 6px);
    left: calc(-20px - 8px);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    ${({ byUser }) =>
      byUser
        ? css`
            box-sizing: border-box;
            background: #fff;
            border: 4px solid #5359e9;
          `
        : css`
            background: #03e7cb;
          `}
  }
  ${media.mobile}{
    font-size: 14px;
    &:after {
      top: calc(8px + 6px);
      left: calc(-10px - 8px);
    }
  }
`;

const EditTextBox = styled.form`
  position: relative;
  margin-bottom: 40px;
  > div.buttonBox{
    display:flex;
    justify-content:center;
  }
  & > * {
    margin: 0 auto 5px;
  }
`;

const TextArea = styled.textarea`
  background: #ebecfc;
  border: 0;
  resize: none;
  border-radius: 20px;
  width: 100%;
  min-height: 140px;
  padding: 20px 30px;
  line-height: 1.6;

  &:focus {
    outline: 2px solid #8c9af3;
  }
  ${media.mobile}{
    font-size: 14px;
    padding: 15px 20px;
  }
`;

const SuccessMsg = styled.span`
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #4449c2;
`;

const ErrorMsg = styled(SuccessMsg)`
  color: ${({ theme }) => theme.color.error};
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const CircleDeleteButton = styled.button<{ recordId: number }>`
  position: relative;
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.color.error};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30px;
  transition: background 0.4s, width 0.4s;

  svg {
    width: 22px;
    height: 22px;
    fill: ${({ theme }) => theme.color.white};
    transition: transform 0.4s;
  }

  span {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-95%, -50%);
    width: 120px;
    z-index: -1;
    font-size: 14px;
    font-weight: 700;
    color: ${({ theme }) => theme.color.error};
    opacity: 0;
    transition: opacity 0.4s, zIndex 0.4s, transform 0.4s;
  }

  &:hover {
    background: ${({ theme }) => theme.color.white};

    svg {
      fill: ${({ theme }) => theme.color.error};
    }
  }

  &.active {
    background: ${({ theme }) => theme.color.white};

    svg {
      fill: ${({ theme }) => theme.color.error};
    }

    span {
      opacity: 1;
      z-index: 1;
      transform: translate(-105%, -50%);
    }
  }
  ${media.mobile}{
    width: 30px;
    height: 30px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const HospitalModalCloseButtonBox = styled.div`
  padding-bottom: 50px;
  > button {
    margin: 0 auto;
  }
`;
