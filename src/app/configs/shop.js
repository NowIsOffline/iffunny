// config/shop.js

export const SHOP_SITE_CFG = {
  1:{
      id:1,
    iconType:"item",
    name: "Shop",
    desc: "应用商店",
    logo: "/icon/store.png",
    url: "#shop",
    openType: "internal",
    stopDelete: true,
    createTime: "2025-05-01T00:00:00"
  },
  2: {
      id:2,
    iconType:"item",
    name: "TetrisGame",
    desc: "俄罗斯方块小游戏",
    logo: "/icon/tetris.ico",
    url: "/games/tetris",
    openType: "link",
    stopDelete: false,
    createTime: "2025-05-02T00:00:00"
  },
  3:{
      id:3,
      iconType:"item",
      name: "Image Puzzle",
      desc: "图像拼图生成器",
      logo: "/icon/puzzle.ico",
      url: "/tools/puzzle",
      openType: "link",
      stopDelete: false,
      createTime: "2025-05-03T00:00:00"
    },
  4: {
      id:4,
      iconType:"item",
      name: "PNG to ICO",
      desc: "图标转换工具",
      logo: "/icon/png2ico.ico",
      url: "/tools/png2ico",
      openType: "link",
      stopDelete: false,
      createTime: "2025-05-04T00:00:00"
    },
    5:{
        id:5,
      iconType:"item",
      name: "choice-helper",
      desc: "图标转换工具",
      logo: "/icon/choice-helper.ico",
      url: "/tools/choice-helper",
      openType: "link",
      stopDelete: false,
      createTime: "2025-05-04T00:00:00"
    },
    6:{
        id:6,
      iconType:"item",
      name: "txt reader",
      desc: "txt reader",
      logo: "/icon/education.ico",
      url: "/tools/txtreader",
      openType: "link",
      stopDelete: false,
      createTime: "2025-05-04T00:00:00"
    }
};
