using System;

namespace Unosquare.Tubular
{
    public class Common
    {
        static public readonly Type[] PrimitiveTypes = new Type[] 
        { 
            typeof(string), 
            typeof(DateTime),
            typeof(DateTimeOffset),
            typeof(bool), 
            typeof(byte), 
            typeof(sbyte),
            typeof(char), 
            typeof(decimal),
            typeof(double),
            typeof(float), 
            typeof(int), 
            typeof(uint), 
            typeof(long),
            typeof(ulong),
            typeof(short), 
            typeof(ushort),
            typeof(DateTime?),
            typeof(DateTimeOffset?),
            typeof(bool?), 
            typeof(byte?), 
            typeof(sbyte?),
            typeof(char?), 
            typeof(decimal?),
            typeof(double?),
            typeof(float?), 
            typeof(int?), 
            typeof(uint?), 
            typeof(long?),
            typeof(ulong?),
            typeof(short?), 
            typeof(ushort?),
            typeof(Guid),
            typeof(Guid?)
        };

        static public readonly Type[] NumericTypes = new Type[]  { 
            typeof(byte), 
            typeof(sbyte),
            typeof(decimal),
            typeof(double),
            typeof(float), 
            typeof(int), 
            typeof(uint), 
            typeof(long),
            typeof(ulong),
            typeof(short), 
            typeof(ushort),
            typeof(byte?), 
            typeof(sbyte?),
            typeof(decimal?),
            typeof(double?),
            typeof(float?), 
            typeof(int?), 
            typeof(uint?), 
            typeof(long?),
            typeof(ulong?),
            typeof(short?), 
            typeof(ushort?) 
        };
    }
}
