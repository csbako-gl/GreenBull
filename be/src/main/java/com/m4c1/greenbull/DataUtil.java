package com.m4c1.greenbull;

public class DataUtil {
    public static Integer ushortToShort(Integer val) {
        return 32767 >= val ? val : val - Character.MAX_VALUE;
    }
}
