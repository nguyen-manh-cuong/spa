using System;

namespace Viettel
{
    public class ConstantWrapper<T>
    {
        public ConstantWrapper(T value)
        {
            this.Value = value;
        }
        public T Value { get; private set; }
    }
}
