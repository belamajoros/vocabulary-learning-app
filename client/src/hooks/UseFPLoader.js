import React, { useState } from 'react'
import FPLoader from '../component/FPLoader'

const UseFPLoader = () => {
    const [loading, setLoading] = useState(false)
    return [
        loading ? <FPLoader/> : null,
        () => setLoading(true),
        () => setLoading(false)
    ];
};

export default UseFPLoader
