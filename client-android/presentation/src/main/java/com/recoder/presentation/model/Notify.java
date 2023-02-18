package com.recoder.presentation.model;

import java.util.Random;

public class Notify {

  private String mId;
  private String mType;
  private String mTitle;
  private String mText;
  private int mTimeout;

  public Notify(String type, String text) {
    this(type, text, 0);
  }

  public Notify(String type, String text, int timeout) {
    this(type, null, text, timeout);
  }

  public Notify(String type, String title, String text, int timeout) {
    this.mId = getRandomString(6).toLowerCase();
    this.mType = type;
    this.mTitle = title;
    this.mText = text;
    this.mTimeout = timeout;
    if (this.mTimeout == 0) {
      if ("info".equals(this.mType)) {
        this.mTimeout = 3000;
      } else if ("error".equals(this.mType)) {
        this.mTimeout = 5000;
      }
    }
  }

  public String getId() {
    return mId;
  }

  public String getType() {
    return mType;
  }

  public String getTitle() {
    return mTitle;
  }

  public String getText() {
    return mText;
  }

  public int getTimeout() {
    return mTimeout;
  }

  private static final String ALLOWED_CHARACTERS = "0123456789qwertyuiopasdfghjklzxcvbnm";

  private static String getRandomString(final int sizeOfRandomString) {
    final Random random = new Random();
    final StringBuilder sb = new StringBuilder(sizeOfRandomString);
    for (int i = 0; i < sizeOfRandomString; ++i)
      sb.append(ALLOWED_CHARACTERS.charAt(random.nextInt(ALLOWED_CHARACTERS.length())));
    return sb.toString();
  }
}
