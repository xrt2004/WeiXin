
//获取应用实例
var app = getApp()
var that;
var common = require('../template/getCode.js');
var Bmob=require("../../utils/bmob.js");
Page({
  onLoad: function(options) {
      that=this;   
      that.setData({
        upImg:true,
        loading:false,
        isdisabled:false,
        modifyLoading:false
      }) 
  },
  onReady:function(){
     wx.hideToast() 
  },
  onShow: function() {
    
    
    var myInterval=setInterval(getReturn,500);
    function getReturn(){
        wx.getStorage({
          key: 'user_id',
          success: function(ress) {
            if(ress.data)
            {
              clearInterval(myInterval)
              wx.getStorage({
                key: 'my_avatar',
                success: function(res) {
                    that.setData({
                      userImg:res.data,
                      loading:true
                  })
                } 
              })//end  wx.getStorage
              wx.getStorage({
                key: 'my_nick',
                success: function(res) {
                    that.setData({
                      userName:res.data,
                      inputValue:res.data
                    
                  })
                } 
              })//end  wx.getStorage
              var newsLen=0;
            
            }
            
          } 
        })  //wx.getStorage 
        
    }
    
  }  //end onshow()
  ,
  modifyImg:function(){//修改头像,弹出 相册，拍照，取消框
    wx.getStorage({
      key: 'user_id',
      success: function(ress) {
          var key=ress.data
          if(key)
          {
            wx.showActionSheet({
            itemList: ['相册', '拍照'],
            success: function(res) {

              //=================如果不是Cancel==================
              if (!res.cancel) 
              {
                var sourceType=[];
                if(res.tapIndex==0)
                {
                  sourceType=['album']//从相册选择
                }
                else if(res.tapIndex==1)
                {
                  sourceType=['camera']//拍照
                }
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType:sourceType, // 可以指定来源是相册还是相机，默认二者都有
                    success: function (imageResult) {
                      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                      that.setData({
                        upImg:false
                      })
                      var tempFilePaths = imageResult.tempFilePaths;
                      if(tempFilePaths.length>0){
                          var name=tempFilePaths;//上传的图片的别名
                          var file=new Bmob.File(name,tempFilePaths);
                          file.save().then(function(resu){
                            //将上传的路径保持在缓存中
                            wx.setStorageSync('my_avatar',resu.url());
                            that.setData({
                              upImg:true
                            });
                            var newImge=resu.url();
                            //从缓存中得到用户名
                            wx.getStorage({
                              key: 'my_username',
                              success: function(ress) {
                                var my_username=ress.data;

                                wx.getStorage({
                                  key: 'user_openid',
                                  success: function(openid) {
                                    var openid=openid.data
                                    //-------从Bomb中根据openid 找到用户信息-----------
                                    var user = Bmob.User.logIn(my_username,openid, {
                                      success: function(users) {
                                        //修改用户的图片
                                        users.set('userPic', newImge);  // attempt to change username
                                        users.save(null, {
                                          success: function(user) {
                                            that.setData({
                                              userImg:newImge
                                            })
                                            common.dataLoading("修改头像成功","success");
                                          }
                                        }); //end  users.save
                                      }
                                    });//----------找到用户信息----------------
                                  },
                                  function(error){    //如果缓存中没找到 user_openid
                                    console.log(error);
                                  }
                                })
                              },function(error){    //如果缓存中没找到 my_username
                                console.log(error);
                              }
                            })
                          },function(error){    //Bmob 保存文件失败
                            that.setData({
                              upImg:true
                            })
                            common.dataLoading(error,"loading");
                            console.log(error);
                          })
                      }
                      
                    }
                  })
              }   //  end if ===============================
            }
          })   //end showActionSheet
          }
          
      } 
    })
    
  },
  hiddenComment:function(){
    that.setData({
      isModifyNick:false,
      inputValue:that.data.userName
    })
  },
  bindKeyInput: function(e) {//同步input和昵称显示
    that.setData({
      inputValue: e.detail.value
    })
  },
  modifyNick:function(){
    that.setData({
      isModifyNick:true,
    })
  },
  modyfiNick:function(e){//修改昵称
  
    that.setData({
      isdisabled:true,
      modifyLoading:true
    })
    wx.getStorage({
      key: 'my_username',
      success: function(ress) {
        if(ress.data){
            var my_username=ress.data;
            wx.getStorage({
              key: 'user_openid',
              success: function(openid) {
                var openid=openid.data;
                var user = Bmob.User.logIn(my_username,openid, {
                  success: function(users) {
                    users.set('nickname', e.detail.value.changeNick);  // attempt to change username
                    users.save(null, {
                      success: function(user) {
                        wx.setStorageSync('my_nick',e.detail.value.changeNick);
                        that.setData({
                          userName:that.data.inputValue,
                          isModifyNick:false,
                          isdisabled:false,
                          modifyLoading:false
                        })
                        common.dataLoading("修改昵称成功","success");

                      },
                      error: function(error){
                        common.dataLoading(res.data.error,"loading");
                        that.setData({
                          isModifyNick:false,
                          isdisabled:false,
                          modifyLoading:false,
                          inputValue:that.data.userName
                        })
                      }
                    });
                  }
                });
              },function(error){
                console.log(error);
              }
            })
        }
        
      } 
    })
    
  },
  onPullDownRefresh:function(){
    wx.stopPullDownRefresh()
  }
  
})
