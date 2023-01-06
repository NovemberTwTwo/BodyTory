export const kakaoInit = () => {
  const kakao = (window as any).Kakao;
  if (!kakao.isInitialized()) {
    kakao.init("c69513345bcfeb35598f9a14047bb434");
  }

  return kakao;
};
