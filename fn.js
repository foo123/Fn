/**
*  Fn
*  functional utilities, date/time utilities, string/array utiltities, php-like functions/utilities
*
*  https://github.com/foo123/Fn
*
**/
!function( root, name, factory ) {
"use strict";
var m;
if ( ('undefined'!==typeof Components)&&('object'===typeof Components.classes)&&('object'===typeof Components.classesByID)&&Components.utils&&('function'===typeof Components.utils['import']) ) /* XPCOM */
    (root.EXPORTED_SYMBOLS = [ name ]) && (root[ name ] = factory.call( root ));
else if ( ('object'===typeof module)&&module.exports ) /* CommonJS */
    module.exports = factory.call( root );
else if ( ('function'===typeof(define))&&define.amd&&('function'===typeof(require))&&('function'===typeof(require.specified))&&require.specified(name) ) /* AMD */
    define(name,['require','exports','module'],function( ){return factory.call( root );});
else if ( !(name in root) ) /* Browser/WebWorker/.. */
    (root[ name ] = (m=factory.call( root )))&&('function'===typeof(define))&&define.amd&&define(function( ){return m;} );
}(  /* current root */          this, 
    /* module name */           "Fn",
    /* module factory */        function( undef ) {
"use strict";

var toString = Object.prototype.toString,
    trim_re = /^\s+|\s+$/g,
    trim = String.prototype.trim
    ? function( s ){ return s.trim(); }
    : function( s ){ return s.replace(trim_re, ''); },
    window = 'undefined' !== typeof global && '[object global]' === toString.call(global)
            ? global
            : ('undefined' !== typeof window
            ? window
            : this)
;

function rnd( m, M )
{
    return Math.round((M-m)*Math.random() + m);
}
function int( n )
{
    return parseInt(n||0, 10)||0;
}
function float( n )
{
    return parseFloat(n||0, 10)||0;
}
function array( o, n )
{
    return '[object Array]' === toString.call(o)
        ? o
        : (null != o
        ? map(Object.keys(o), function(k){ return o[k]; })
        : ((null != n) && (+n>0)
        ? new Array(+n)
        : []));
}
function pad( s, n, c, right )
{
    if ( null == c ) c = ' ';
    var l = s.length, p = l < n ? new Array(n-l+1).join(c) : '';
    return !!right ? s+p : p+s;
}
function justify( value, prefix, leftJustify, minWidth, zeroPad, customPadChar )
{
    var diff = minWidth - value.length;
    if ( diff > 0 )
    {
        if ( leftJustify || !zeroPad )
            value = pad(value, minWidth, customPadChar, leftJustify);
        else
            value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
    }
    return value;
}

function curry( F, leftwise )
{
    if ( false === leftwise )
    {
        var x1 = slice.call(arguments, 1);
        return function( ) {
            var x0 = arguments;
            return x0.length ? F.apply( this, x0.concat(x1) ) : F.apply( this, x1 );
        };
    }
    else
    {
        var x0 = slice.call(arguments, 1);
        return function( ) {
            var x1 = arguments;
            return x1.length ? F.apply( this, x0.concat(x1) ) : F.apply( this, x0 );
        };
    }
}
function uncurry( F, leftwise )
{
    if ( false === leftwise )
    {
        return function( ) {
            var x = arguments, n = x.length, i, Fi;
            if ( n ) for (i=n-2,Fi=F(x[n-1]); i>=0; i--) Fi = Fi( x[ i ] );
            else Fi = F;
            return Fi;
        };
    }
    else
    {
        return function( ) {
            var x = arguments, n = x.length, i, Fi;
            if ( n ) for (i=1,Fi=F(x[0]); i<n; i++) Fi = Fi( x[ i ] );
            else Fi = F;
            return Fi;
        };
    }
}
function compose( reverse /* args */ )
{
    if ( reverse )
    {
    var F=arguments, l=F.length, r=l&15, q=r&1, l1=l-1, lr=l1-r;
    if ( !l ) return id;
    return function( x ) {
        var k, Fx=q?F[l1](x):x;
        for (k=l1-q; k>lr; k-=2) Fx = F[k-1](F[k](Fx));
        for (k=lr; k>=0; k-=16)  Fx = F[k-15](F[k-14](F[k-13](F[k-12](F[k-11](F[k-10](F[k-9](F[k-8](F[k-7](F[k-6](F[k-5](F[k-4](F[k-3](F[k-2](F[k-1](F[k](Fx))))))))))))))));
        return Fx;
    };
    }
    else
    {
    var F=arguments, l=F.length, r=l&15, q=r&1;
    if ( !l ) return id;
    return function( x ) {
        var k, Fx=q?F[0](x):x;
        for (k=q; k<r; k+=2)  Fx = F[k+1](F[k](Fx));
        for (k=r; k<l; k+=16) Fx = F[k+15](F[k+14](F[k+13](F[k+12](F[k+11](F[k+10](F[k+9](F[k+8](F[k+7](F[k+6](F[k+5](F[k+4](F[k+3](F[k+2](F[k+1](F[k](Fx))))))))))))))));
        return Fx;
    };
    }
}
function operate( x, F, F0, i0, i1, reverse )
{
    var len = x.length;
    if ( arguments.length < 5 ) i1 = len-1;
    if ( 0 > i1 ) i1 += len;
    if ( arguments.length < 4 ) i0 = 0;
    if ( i0 > i1 ) return F0;
    if ( reverse )
    {
    var i, k, l=i1-i0+1, l1=l-1, r=l&15, q=r&1, lr=l1-r, Fv=q?F(F0,x[i1],i1):F0;
    for (i=l1-q; i>lr; i-=2) { k = i0+i; Fv = F(F(Fv,x[k],k),x[k-1],k-1); }
    for (i=lr; i>=0; i-=16)  { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,x[k],k),x[k-1],k-1),x[k-2],k-2),x[k-3],k-3),x[k-4],k-4),x[k-5],k-5),x[k-6],k-6),x[k-7],k-7),x[k-8],k-8),x[k-9],k-9),x[k-10],k-10),x[k-11],k-11),x[k-12],k-12),x[k-13],k-13),x[k-14],k-14),x[k-15],k-15); }
    }
    else
    {
    var i, k, l=i1-i0+1, r=l&15, q=r&1, Fv=q?F(F0,x[i0],i0):F0;
    for (i=q; i<r; i+=2)  { k = i0+i; Fv = F(F(Fv,x[k],k),x[k+1],k+1); }
    for (i=r; i<l; i+=16) { k = i0+i; Fv = F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(F(Fv,x[k],k),x[k+1],k+1),x[k+2],k+2),x[k+3],k+3),x[k+4],k+4),x[k+5],k+5),x[k+6],k+6),x[k+7],k+7),x[k+8],k+8),x[k+9],k+9),x[k+10],k+10),x[k+11],k+11),x[k+12],k+12),x[k+13],k+13),x[k+14],k+14),x[k+15],k+15); }
    }
    return Fv;
}
function map( x, F, i0, i1, reverse )
{
    var len = x.length;
    if ( arguments.length < 4 ) i1 = len-1;
    if ( 0 > i1 ) i1 += len;
    if ( arguments.length < 3 ) i0 = 0;
    if ( i0 > i1 ) return [];
    var i, k, l=i1-i0+1, l1, lr, r, q, Fx=new Array(l);
    if ( reverse )
    {
        l1=l-1; r=l&15; q=r&1; lr=l1-r;
        if ( q ) Fx[0] = F(x[i1], i1, i0, i1);
        for (i=l1-q; i>lr; i-=2)
        { 
            k = i0+i;
            Fx[i  ] = F(x[k  ], k  , i0, i1);
            Fx[i+1] = F(x[k-1], k-1, i0, i1);
        }
        for (i=lr; i>=0; i-=16)
        {
            k = i0+i;
            Fx[i  ] = F(x[k  ], k  , i0, i1);
            Fx[i+1] = F(x[k-1], k-1, i0, i1);
            Fx[i+2] = F(x[k-2], k-2, i0, i1);
            Fx[i+3] = F(x[k-3], k-3, i0, i1);
            Fx[i+4] = F(x[k-4], k-4, i0, i1);
            Fx[i+5] = F(x[k-5], k-5, i0, i1);
            Fx[i+6] = F(x[k-6], k-6, i0, i1);
            Fx[i+7] = F(x[k-7], k-7, i0, i1);
            Fx[i+8] = F(x[k-8], k-8, i0, i1);
            Fx[i+9] = F(x[k-9], k-9, i0, i1);
            Fx[i+10] = F(x[k-10], k-10, i0, i1);
            Fx[i+11] = F(x[k-11], k-11, i0, i1);
            Fx[i+12] = F(x[k-12], k-12, i0, i1);
            Fx[i+13] = F(x[k-13], k-13, i0, i1);
            Fx[i+14] = F(x[k-14], k-14, i0, i1);
            Fx[i+15] = F(x[k-15], k-15, i0, i1);
        }
    }
    else
    {
        r=l&15; q=r&1;
        if ( q ) Fx[0] = F(x[i0], i0, i0, i1);
        for (i=q; i<r; i+=2)
        { 
            k = i0+i;
            Fx[i  ] = F(x[k  ], k  , i0, i1);
            Fx[i+1] = F(x[k+1], k+1, i0, i1);
        }
        for (i=r; i<l; i+=16)
        {
            k = i0+i;
            Fx[i  ] = F(x[k  ], k  , i0, i1);
            Fx[i+1] = F(x[k+1], k+1, i0, i1);
            Fx[i+2] = F(x[k+2], k+2, i0, i1);
            Fx[i+3] = F(x[k+3], k+3, i0, i1);
            Fx[i+4] = F(x[k+4], k+4, i0, i1);
            Fx[i+5] = F(x[k+5], k+5, i0, i1);
            Fx[i+6] = F(x[k+6], k+6, i0, i1);
            Fx[i+7] = F(x[k+7], k+7, i0, i1);
            Fx[i+8] = F(x[k+8], k+8, i0, i1);
            Fx[i+9] = F(x[k+9], k+9, i0, i1);
            Fx[i+10] = F(x[k+10], k+10, i0, i1);
            Fx[i+11] = F(x[k+11], k+11, i0, i1);
            Fx[i+12] = F(x[k+12], k+12, i0, i1);
            Fx[i+13] = F(x[k+13], k+13, i0, i1);
            Fx[i+14] = F(x[k+14], k+14, i0, i1);
            Fx[i+15] = F(x[k+15], k+15, i0, i1);
        }
    }
    return Fx;
}
function filter( x, F, i0, i1, reverse )
{
    var len = x.length;
    if ( arguments.length < 4 ) i1 = len-1;
    if ( 0 > i1 ) i1 += len;
    if ( arguments.length < 3 ) i0 = 0;
    if ( i0 > i1 ) return [];
    var i, k, l=i1-i0+1, l1, lr, r, q, Fx=[];
    if ( reverse )
    {
        l1=l-1; r=l&15; q=r&1; lr=l1-r;
        if ( q && F(x[i1], i1, x) ) Fx.push(x[i1]);
        for (i=l1-q; i>lr; i-=2)
        { 
            k = i0+i;
            if ( F(x[  k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
        }
        for (i=lr; i>=0; i-=16)
        {
            k = i0+i;
            if ( F(x[  k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
            if ( F(x[--k], k, x) ) Fx.push(x[k]);
        }
    }
    else
    {
        r=l&15; q=r&1;
        if ( q && F(x[i0], i0, x) ) Fx.push(x[i0]);
        for (i=q; i<r; i+=2)
        { 
            k = i0+i;
            if ( F(x[  k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
        }
        for (i=r; i<l; i+=16)
        {
            k = i0+i;
            if ( F(x[  k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
            if ( F(x[++k], k, x) ) Fx.push(x[k]);
        }
    }
    return Fx;
}
function each( x, F, i0, i1, reverse )
{
    var len = x.length;
    if ( arguments.length < 4 ) i1 = len-1;
    if ( 0 > i1 ) i1 += len;
    if ( arguments.length < 3 ) i0 = 0;
    if ( i0 > i1 ) return x;
    var i, k, l=i1-i0+1, l1, lr, r, q;
    if ( reverse )
    {
        l1=l-1; r=l&15; q=r&1; lr=l1-r;
        if ( q ) F(x[i1], i1, x, i0, i1);
        for (i=l1-q; i>lr; i-=2)
        { 
            k = i0+i;
            F(x[  k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
        }
        for (i=lr; i>=0; i-=16)
        {
            k = i0+i;
            F(x[  k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
            F(x[--k], k, x, i0, i1);
        }
    }
    else
    {
        r=l&15; q=r&1;
        if ( q ) F(x[i0], i0, x, i0, i1);
        for (i=q; i<r; i+=2)
        { 
            k = i0+i;
            F(x[  k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
        }
        for (i=r; i<l; i+=16)
        {
            k = i0+i;
            F(x[  k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
            F(x[++k], k, x, i0, i1);
        }
    }
    return x;
}
// http://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo.27s_algorithm
function shuffle( a, cyclic, copied )
{
    var N, perm, swap, ac, offset;
    ac = true === copied ? a.slice() : a;
    offset = true === cyclic ? 1 : 0;
    N = ac.length;
    while ( offset < N-- )
    { 
        perm = rnd( 0, N-offset ); 
        if ( N === perm ) continue;
        swap = ac[ N ]; 
        ac[ N ] = ac[ perm ]; 
        ac[ perm ] = swap; 
    }
    // in-place or copy
    return ac;
}
// http://stackoverflow.com/a/32035986/3591273
function pick( a, k, non_destructive )
{
    var picked, backup, i, selected, value, n = a.length;
    k = Math.min( k, n );
    picked = new Array( k );
    non_destructive = false !== non_destructive;
    if ( non_destructive ) backup = new Array( k );
    
    // partially shuffle the array, and generate unbiased selection simultaneously
    // this is a variation on fisher-yates-knuth shuffle
    for (i=0; i<k; i++) // O(k) times
    { 
        selected = rnd( 0, --n ); // unbiased sampling n * n-1 * n-2 * .. * n-k+1
        value = a[ selected ];
        a[ selected ] = a[ n ];
        a[ n ] = value;
        non_destructive && (backup[ i ] = selected);
        picked[ i ] = value;
    }
    if ( non_destructive )
    {
        // restore partially shuffled input array from backup
        for (i=k-1; i>=0; i--) // O(k) times
        { 
            selected = backup[ i ];
            value = a[ n ];
            a[ n ] = a[ selected ];
            a[ selected ] = value;
            n++;
        }
    }
    return picked;
}
function kronecker( /* var args here */ )
{
    var k, a, r, l, i, j, vv, tensor,
        v = arguments, nv = v.length,
        kl, product;
    
    if ( !nv ) return [];
    kl = v[0].length;
    for (k=1; k<nv; k++) kl *= v[ k ].length;
    product = new Array( kl );
    
    for (k=0; k<kl; k++)
    {
        tensor = [ ];
        for (r=k,a=nv-1; a>=0; a--)
        {
            l = v[ a ].length;
            i = r % l;
            r = ~~(r / l);
            vv = v[ a ][ i ];
            if ( vv instanceof Array )
            {
                // kronecker can be re-used to create higher-order products
                // i.e kronecker(alpha, beta, gamma) and kronecker(kronecker(alpha, beta), gamma)
                // should produce exactly same results
                for (j=vv.length-1; j>=0; j--)
                    tensor.unshift( vv[ j ] );
            }
            else
            {
                tensor.unshift( vv );
            }
        }
        product[ k ] = tensor;
    }
    return product;
}
function cartesian( /* var args here */ )
{
}
// Array multi - sorter utility
// returns a sorter that can (sub-)sort by multiple (nested) fields 
// each ascending or descending independantly
// https://github.com/foo123/sinful.js
function sorter( )
{
    var arr = this, i, args = arguments, l = args.length,
        a, b, avar, bvar, variables, step, lt, gt,
        field, filter_args, sorter_args, desc, dir, sorter,
        ASC = '|^', DESC = '|v';
    // |^ after a (nested) field indicates ascending sorting (default), 
    // example "a.b.c|^"
    // |v after a (nested) field indicates descending sorting, 
    // example "b.c.d|v"
    if ( l )
    {
        step = 1;
        sorter = [];
        variables = [];
        sorter_args = [];
        filter_args = []; 
        for (i=l-1; i>=0; i--)
        {
            field = args[i];
            // if is array, it contains a filter function as well
            filter_args.unshift('f'+i);
            if ( field.push )
            {
                sorter_args.unshift(field[1]);
                field = field[0];
            }
            else
            {
                sorter_args.unshift(null);
            }
            dir = field.slice(-2);
            if ( DESC === dir ) 
            {
                desc = true;
                field = field.slice(0,-2);
            }
            else if ( ASC === dir )
            {
                desc = false;
                field = field.slice(0,-2);
            }
            else
            {
                // default ASC
                desc = false;
            }
            field = field.length ? '["' + field.split('.').join('"]["') + '"]' : '';
            a = "a"+field; b = "b"+field;
            if ( sorter_args[0] ) 
            {
                a = filter_args[0] + '(' + a + ')';
                b = filter_args[0] + '(' + b + ')';
            }
            avar = 'a_'+i; bvar = 'b_'+i;
            variables.unshift(''+avar+'='+a+','+bvar+'='+b+'');
            lt = desc ?(''+step):('-'+step); gt = desc ?('-'+step):(''+step);
            sorter.unshift("("+avar+" < "+bvar+" ? "+lt+" : ("+avar+" > "+bvar+" ? "+gt+" : 0))");
            step <<= 1;
        }
        // use optional custom filters as well
        return (new Function(
                filter_args.join(','), 
                ['return function(a,b) {',
                 '  var '+variables.join(',')+';',
                 '  return '+sorter.join('+')+';',
                 '};'].join("\n")
                ))
                .apply(null, sorter_args);
    }
    else
    {
        a = "a"; b = "b"; lt = '-1'; gt = '1';
        sorter = ""+a+" < "+b+" ? "+lt+" : ("+a+" > "+b+" ? "+gt+" : 0)";
        return new Function("a,b", 'return '+sorter+';');
    }
}

function timestamp( fmt, dt )
{
    dt = dt || new Date( );
    var fd = '', i, l = fmt.length, c;
    for (i=0; i<l; i++)
    {
        c = fmt.charAt(i);
        switch(c)
        {
            case 'Y': c = pad(dt.getFullYear(), 4, '0'); break;
            case 'm': c = pad(dt.getMonth()+1, 2, '0'); break;
            case 'd': c = pad(dt.getDate(), 2, '0'); break;
            case 'H': c = pad(dt.getHours(), 2, '0'); break;
            case 'i': c = pad(dt.getMinutes(), 2, '0'); break;
            case 's': c = pad(dt.getSeconds(), 2, '0'); break;
            case 'u': c = pad(dt.getMilliseconds(), 3, '0'); break;
        }
        fd += c;
    }
    return fd;
}
function datetime( fmt, dt )
{
    var i, j, l = fmt.length, c, o = {};
    for (i=0,j=0; i<l; i++)
    {
        c = fmt.charAt(i);
        switch(c)
        {
            case 'Y': o.Y = int(dt.slice(j,j+4)); j+=4; break;
            case 'm': o.m = int(dt.slice(j,j+2))-1; j+=2; break;
            case 'd': o.d = int(dt.slice(j,j+2)); j+=2; break;
            case 'H': o.H = int(dt.slice(j,j+2)); j+=2; break;
            case 'i': o.i = int(dt.slice(j,j+2)); j+=2; break;
            case 's': o.s = int(dt.slice(j,j+2)); j+=2; break;
            case 'u': o.u = int(dt.slice(j,j+3)); j+=3; break;
            default: j+=1; break;
        }
    }
    return new Date(
        o.Y, o.m, o.d,
        null != o.H ? o.H : 0,
        null != o.i ? o.i : 0,
        null != o.s ? o.s : 0,
        null != o.u ? o.u : 0
    );
}

function formatBaseX( value, base, prefix, leftJustify, minWidth, precision, zeroPad )
{
    // Note: casts negative numbers to positive ones
    var number = value >>> 0;
    prefix = prefix && number && {
    '2': '0b',
    '8': '0',
    '16': '0x'
    }[base] || '';
    value = prefix + pad(number.toString(base), precision||0, '0', false);
    return justify(value, prefix, leftJustify, minWidth, zeroPad);
}
function formatString( value, leftJustify, minWidth, precision, zeroPad, customPadChar )
{
    if ( null != precision ) value = value.slice(0, precision);
    return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
}
function sprintf( fmt, args )
{
    /* 
     * More info at: http://phpjs.org
     * 
     * This is version: 3.24
     * php.js is copyright 2011 Kevin van Zonneveld.
     */
    // http://kevin.vanzonneveld.net
    // +   original by: Ash Searle (http://hexmen.com/blog/)
    // + namespaced by: Michael White (http://getsprink.com)
    // +    tweaked by: Jack
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Paulo Freitas
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Dj
    // +   improved by: Allidylls
    // *     example 1: sprintf("%01.2f", 123.1);
    // *     returns 1: 123.10
    // *     example 2: sprintf("[%10s]", 'monkey');
    // *     returns 2: '[    monkey]'
    // *     example 3: sprintf("[%'#10s]", 'monkey');
    // *     returns 3: '[####monkey]'
    // *     example 4: sprintf("%d", 123456789012345);
    // *     returns 4: '123456789012345'
    var i = 0, a = args;
    var do_format = function do_format( substring, valueIndex, flags, minWidth, _, precision, type ) {
        var number, prefix, method, textTransform, value;
        if ( '%%' == substring ) return '%';

        // parse flags
        var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false,
            j, customPadChar = ' ', flagsl = flags.length;
        for (j=0; flags && j < flagsl; j++)
        {
            switch( flags.charAt(j) )
            {
                case ' ':
                    positivePrefix = ' ';
                    break;
                case '+':
                    positivePrefix = '+';
                    break;
                case '-':
                    leftJustify = true;
                    break;
                case "'":
                    customPadChar = flags.charAt(j + 1);
                    break;
                case '0':
                    zeroPad = true;
                    break;
                case '#':
                    prefixBaseX = true;
                    break;
            }
        }

        // parameters may be null, undefined, empty-string or real valued
        // we want to ignore null, undefined and empty-string values
        if ( !minWidth ) minWidth = 0;
        else if ( '*' == minWidth ) minWidth = +a[i++];
        else if ( '*' == minWidth.charAt(0) ) minWidth = +a[minWidth.slice(1, -1)];
        else minWidth = +minWidth;

        // Note: undocumented perl feature:
        if ( 0 > minWidth )
        {
            minWidth = -minWidth;
            leftJustify = true;
        }

        if ( !isFinite(minWidth) )
        {
            throw new Error('sprintf: (minimum-)width must be finite');
        }

        if ( !precision ) precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : undefined;
        else if ( '*' == precision ) precision = +a[i++];
        else if ( '*' == precision.charAt(0) ) precision = +a[precision.slice(1, -1)];
        else precision = +precision;

        // grab value using valueIndex if required?
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

        switch( type )
        {
            case 's':
                return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
            case 'c':
                return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
            case 'b':
                return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'o':
                return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'x':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'X':
                return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
            case 'u':
                return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
            case 'i':
            case 'd':
                number = +value || 0;
                number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
                prefix = number < 0 ? '-' : positivePrefix;
                value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                return justify(value, prefix, leftJustify, minWidth, zeroPad);
            case 'e':
            case 'E':
            case 'f': // Should handle locales (as per setlocale)
            case 'F':
            case 'g':
            case 'G':
                number = +value;
                prefix = number < 0 ? '-' : positivePrefix;
                method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                value = prefix + Math.abs(number)[method](precision);
                return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
            default:
                return substring;
        }
    };
    return fmt.replace( sprintf.format_re, do_format );
}
sprintf.format_re = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g;

function intersect_sorted2( a, b )
{
    var ai = 0, bi = 0, intersection = [ ],
    al = a.length, bl = b.length;
    // assume a, b lists are sorted ascending
    while( ai < al && bi < bl )
    {
        if      ( a[ai] < b[bi] )
        { 
            ai++; 
        }
        else if ( a[ai] > b[bi] )
        { 
            bi++; 
        }
        else // they're equal
        {
            intersection.push( a[ ai ] );
            ai++; bi++;
        }
    }
    return intersection;
}

var fn = {
     int: int
    ,float: float
    ,array: array
    ,pad: pad
    ,trim: trim
    ,curry: curry
    ,uncurry: uncurry
    ,compose: compose
    ,operate: operate
    ,map: map
    ,filter: filter
    ,each: each
    ,sorter: sorter
    ,shuffle: shuffle
    ,pick: pick
    ,kronecker: kronecker
    ,intersect: intersect_sorted2
    ,get: function( p ) {
        return function( x ){
            return x[ p ];
        };
    }
    ,typecast: function typecast( T ) {
        return 'function' === typeof T
            ? T
            : function( x ) {
                for (var n in T)
                {
                    if ( !T.hasOwnProperty(n) ) continue;
                    x[n] = T[n]( x[n] );
                }
                return x;
            };
    }
    ,sprintf: sprintf
    ,timestamp: timestamp
    ,datetime: datetime
};


/* 
 * More info at: http://phpjs.org
 * 
 * This is version: 3.24
 * php.js is copyright 2011 Kevin van Zonneveld.
 * 
 * Portions copyright Brett Zamir (http://brett-zamir.me), Kevin van Zonneveld
 * (http://kevin.vanzonneveld.net), Onno Marsman, Theriault, Michael White
 * (http://getsprink.com), Waldo Malqui Silva, Paulo Freitas, Jonas Raoni
 * Soares Silva (http://www.jsfromhell.com), Jack, Philip Peterson, Ates Goral
 * (http://magnetiq.com), Legaev Andrey, Ratheous, Alex, Martijn Wieringa,
 * Nate, lmeyrick (https://sourceforge.net/projects/bcmath-js/), Enrique
 * Gonzalez, Philippe Baumann, Rafał Kukawski (http://blog.kukawski.pl),
 * Webtoolkit.info (http://www.webtoolkit.info/), Ole Vrijenhoek, Ash Searle
 * (http://hexmen.com/blog/), travc, Carlos R. L. Rodrigues
 * (http://www.jsfromhell.com), Jani Hartikainen, stag019, GeekFG
 * (http://geekfg.blogspot.com), WebDevHobo (http://webdevhobo.blogspot.com/),
 * Erkekjetter, pilus, Rafał Kukawski (http://blog.kukawski.pl/), Johnny Mast
 * (http://www.phpvrouwen.nl), T.Wild,
 * http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript,
 * d3x, Michael Grier, Andrea Giammarchi (http://webreflection.blogspot.com),
 * marrtins, Mailfaker (http://www.weedem.fr/), Steve Hilder, gettimeofday,
 * mdsjack (http://www.mdsjack.bo.it), felix, majak, Steven Levithan
 * (http://blog.stevenlevithan.com), Mirek Slugen, Oleg Eremeev, Felix
 * Geisendoerfer (http://www.debuggable.com/felix), Martin
 * (http://www.erlenwiese.de/), gorthaur, Lars Fischer, Joris, AJ, Paul Smith,
 * Tim de Koning (http://www.kingsquare.nl), KELAN, Josh Fraser
 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
 * Chris, Marc Palau, Kevin van Zonneveld (http://kevin.vanzonneveld.net/),
 * Arpad Ray (mailto:arpad@php.net), Breaking Par Consulting Inc
 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
 * Nathan, Karol Kowalski, David, Dreamer, Diplom@t (http://difane.com/), Caio
 * Ariede (http://caioariede.com), Robin, Imgen Tata (http://www.myipdf.com/),
 * Pellentesque Malesuada, saulius, Aman Gupta, Sakimori, Tyler Akins
 * (http://rumkin.com), Thunder.m, Public Domain
 * (http://www.json.org/json2.js), Michael White, Kankrelune
 * (http://www.webfaktory.info/), Alfonso Jimenez
 * (http://www.alfonsojimenez.com), Frank Forte, vlado houba, Marco, Billy,
 * David James, madipta, noname, sankai, class_exists, Jalal Berrami, ger,
 * Itsacon (http://www.itsacon.net/), Scott Cariss, nobbler, Arno, Denny
 * Wardhana, ReverseSyntax, Mateusz "loonquawl" Zalega, Slawomir Kaniecki,
 * Francois, Fox, mktime, Douglas Crockford (http://javascript.crockford.com),
 * john (http://www.jd-tech.net), Oskar Larsson Högfeldt
 * (http://oskar-lh.name/), marc andreu, Nick Kolosov (http://sammy.ru), date,
 * Marc Jansen, Steve Clay, Olivier Louvignes (http://mg-crea.com/), Soren
 * Hansen, merabi, Subhasis Deb, josh, T0bsn, Tim Wiel, Brad Touesnard, MeEtc
 * (http://yass.meetcweb.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Pyerre, Jon Hohle, duncan, Bayron
 * Guevara, Adam Wallner (http://web2.bitbaro.hu/), paulo kuong, Gilbert,
 * Lincoln Ramsay, Thiago Mata (http://thiagomata.blog.com), Linuxworld,
 * lmeyrick (https://sourceforge.net/projects/bcmath-js/this.), djmix, Bryan
 * Elliott, David Randall, Sanjoy Roy, jmweb, Francesco, Stoyan Kyosev
 * (http://www.svest.org/), J A R, kenneth, T. Wild, Ole Vrijenhoek
 * (http://www.nervous.nl/), Raphael (Ao RUDLER), Shingo, LH, JB, nord_ua, jd,
 * JT, Thomas Beaucourt (http://www.webapp.fr), Ozh, XoraX
 * (http://www.xorax.info), EdorFaus, Eugene Bulkin (http://doubleaw.com/),
 * Der Simon (http://innerdom.sourceforge.net/), 0m3r, echo is bad,
 * FremyCompany, stensi, Kristof Coomans (SCK-CEN Belgian Nucleair Research
 * Centre), Devan Penner-Woelk, Pierre-Luc Paour, Martin Pool, Brant Messenger
 * (http://www.brantmessenger.com/), Kirk Strobeck, Saulo Vallory, Christoph,
 * Wagner B. Soares, Artur Tchernychev, Valentina De Rosa, Jason Wong
 * (http://carrot.org/), Daniel Esteban, strftime, Rick Waldron, Mick@el,
 * Anton Ongson, Bjorn Roesbeke (http://www.bjornroesbeke.be/), Simon Willison
 * (http://simonwillison.net), Gabriel Paderni, Philipp Lenssen, Marco van
 * Oort, Bug?, Blues (http://tech.bluesmoon.info/), Tomasz Wesolowski, rezna,
 * Eric Nagel, Evertjan Garretsen, Luke Godfrey, Pul, Bobby Drake, uestla,
 * Alan C, Ulrich, Zahlii, Yves Sucaet, sowberry, Norman "zEh" Fuchs, hitwork,
 * johnrembo, Brian Tafoya (http://www.premasolutions.com/), Nick Callen,
 * Steven Levithan (stevenlevithan.com), ejsanders, Scott Baker, Philippe
 * Jausions (http://pear.php.net/user/jausions), Aidan Lister
 * (http://aidanlister.com/), Rob, e-mike, HKM, ChaosNo1, metjay, strcasecmp,
 * strcmp, Taras Bogach, jpfle, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), DxGx, kilops, Orlando,
 * dptr1988, Le Torbi, James (http://www.james-bell.co.uk/), Pedro Tainha
 * (http://www.pedrotainha.com), James, penutbutterjelly, Arnout Kazemier
 * (http://www.3rd-Eden.com), 3D-GRAF, daniel airton wermann
 * (http://wermann.com.br), jakes, Yannoo, FGFEmperor, gabriel paderni, Atli
 * Þór, Maximusya, Diogo Resende, Rival, Howard Yeend, Allan Jensen
 * (http://www.winternet.no), davook, Benjamin Lupton, baris ozdil, Greg
 * Frazier, Manish, Matt Bradley, Cord, fearphage
 * (http://http/my.opera.com/fearphage/), Matteo, Victor, taith, Tim de
 * Koning, Ryan W Tenney (http://ryan.10e.us), Tod Gentille, Alexander M
 * Beedie, Riddler (http://www.frontierwebdev.com/), Luis Salazar
 * (http://www.freaky-media.com/), Rafał Kukawski, T.J. Leahy, Luke Smith
 * (http://lucassmith.name), Kheang Hok Chin (http://www.distantia.ca/),
 * Russell Walker (http://www.nbill.co.uk/), Jamie Beck
 * (http://www.terabit.ca/), Garagoth, Andrej Pavlovic, Dino, Le Torbi
 * (http://www.letorbi.de/), Ben (http://benblume.co.uk/), DtTvB
 * (http://dt.in.th/2008-09-16.string-length-in-bytes.html), Michael, Chris
 * McMacken, setcookie, YUI Library:
 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Andreas,
 * Blues at http://hacks.bluesmoon.info/strftime/strftime.js, rem, Josep Sanz
 * (http://www.ws3.es/), Cagri Ekin, Lorenzo Pisani, incidence, Amirouche, Jay
 * Klehr, Amir Habibi (http://www.residence-mixte.com/), Tony, booeyOH, meo,
 * William, Greenseed, Yen-Wei Liu, Ben Bryan, Leslie Hoare, mk.keck
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */ 


// jslint.com configuration options. See: http://wiki.github.com/kvz/phpjs/jslint-options
/* global window */
/* jslint adsafe: false, bitwise: false, browser: false, cap: false, css: false, debug: false, devel: false, eqeqeq: true, evil: false, forin: false, fragment: false, immed: true, indent: 4, laxbreak: false, maxerr: 100, maxlen: 80, newcap: true, nomen: false, on: true, onevar: false, passfail: false, plusplus: false, regexp: false, rhino: false, safe: false, sidebar: false, strict: false, sub: false, undef: true, white: false, widget: false */

// Our idea with CommonJS is that you can do the following:
// var php = require('php');
// php.md5('test');

fn.serialize = function serialize(mixed_value) {
    // Returns a string representation of variable (which can later be unserialized)  
    // 
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/serialize
    // +   original by: Arpad Ray (mailto:arpad@php.net)
    // +   improved by: Dino
    // +   bugfixed by: Andrej Pavlovic
    // +   bugfixed by: Garagoth
    // +      input by: DtTvB (http://dt.in.th/2008-09-16.string-length-in-bytes.html)
    // +   bugfixed by: Russell Walker (http://www.nbill.co.uk/)
    // +   bugfixed by: Jamie Beck (http://www.terabit.ca/)
    // +      input by: Martin (http://www.erlenwiese.de/)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
    // +   improved by: Le Torbi (http://www.letorbi.de/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net/)
    // +   bugfixed by: Ben (http://benblume.co.uk/)
    // -    depends on: utf8_encode
    // %          note: We feel the main purpose of this function should be to ease the transport of data between php & js
    // %          note: Aiming for PHP-compatibility, we have to translate objects to arrays
    // *     example 1: \php.serialize(['Kevin', 'van', 'Zonneveld']);
    // *     returns 1: 'a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}'
    // *     example 2: \php.serialize({firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'});
    // *     returns 2: 'a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}'
    var _utf8Size = function (str) {
        var size = 0,
            i = 0,
            l = str.length,
            code = '';
        for (i = 0; i < l; i++) {
            code = str.charCodeAt(i);
            if (code < 0x0080) {
                size += 1;
            } else if (code < 0x0800) {
                size += 2;
            } else {
                size += 3;
            }
        }
        return size;
    };
    var _getType = function (inp) {
        var type = typeof inp,
            match;
        var key;

        if (type === 'object' && !inp) {
            return 'null';
        }
        if (type === "object") {
            if (!inp.constructor) {
                return 'object';
            }
            var cons = inp.constructor.toString();
            match = cons.match(/(\w+)\(/);
            if (match) {
                cons = match[1].toLowerCase();
            }
            var types = ["boolean", "number", "string", "array"];
            for (key in types) {
                if (cons == types[key]) {
                    type = types[key];
                    break;
                }
            }
        }
        return type;
    };
    var type = _getType(mixed_value);
    var val, ktype = '';

    switch (type) {
    case "function":
        val = "";
        break;
    case "boolean":
        val = "b:" + (mixed_value ? "1" : "0");
        break;
    case "number":
        val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
        break;
    case "string":
        val = "s:" + _utf8Size(mixed_value) + ":\"" + mixed_value + "\"";
        break;
    case "array":
    case "object":
        val = "a";
/*
            if (type == "object") {
                var objname = mixed_value.constructor.toString().match(/(\w+)\(\)/);
                if (objname == undefined) {
                    return;
                }
                objname[1] = this.serialize(objname[1]);
                val = "O" + objname[1].substring(1, objname[1].length - 1);
            }
            */
        var count = 0;
        var vals = "";
        var okey;
        var key;
        for (key in mixed_value) {
            if (mixed_value.hasOwnProperty(key)) {
                ktype = _getType(mixed_value[key]);
                if (ktype === "function") {
                    continue;
                }

                okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
                vals += fn.serialize(okey) + fn.serialize(mixed_value[key]);
                count++;
            }
        }
        val += ":" + count + ":{" + vals + "}";
        break;
    case "undefined":
        // Fall-through
    default:
        // if the JS object has a property which contains a null value, the string cannot be unserialized by PHP
        val = "N";
        break;
    }
    if (type !== "object" && type !== "array") {
        val += ";";
    }
    return val;
};

fn.unserialize = function unserialize(data) {
    // Takes a string representation of variable and recreates it  
    // 
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/unserialize
    // +     original by: Arpad Ray (mailto:arpad@php.net)
    // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
    // +     bugfixed by: dptr1988
    // +      revised by: d3x
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +        input by: Brett Zamir (http://brett-zamir.me)
    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: Chris
    // +     improved by: James
    // +        input by: Martin (http://www.erlenwiese.de/)
    // +     bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     improved by: Le Torbi
    // +     input by: kilops
    // +     bugfixed by: Brett Zamir (http://brett-zamir.me)
    // -      depends on: utf8_decode
    // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
    // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays
    // *       example 1: \php.unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
    // *       returns 1: ['Kevin', 'van', 'Zonneveld']
    // *       example 2: \php.unserialize('a:3:{s:9:"firstName";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
    // *       returns 2: {firstName: 'Kevin', midName: 'van', surName: 'Zonneveld'}
    var that = this;
    var utf8Overhead = function (chr) {
        // http://phpjs.org/functions/unserialize:571#comment_95906
        var code = chr.charCodeAt(0);
        if (code < 0x0080) {
            return 0;
        }
        if (code < 0x0800) {
            return 1;
        }
        return 2;
    };


    var error = function (type, msg, filename, line) {
        throw new window[type](msg, filename, line);
    };
    var read_until = function (data, offset, stopchr) {
        var buf = [];
        var chr = data.slice(offset, offset + 1);
        var i = 2;
        while (chr != stopchr) {
            if ((i + offset) > data.length) {
                error('Error', 'Invalid');
            }
            buf.push(chr);
            chr = data.slice(offset + (i - 1), offset + i);
            i += 1;
        }
        return [buf.length, buf.join('')];
    };
    var read_chrs = function (data, offset, length) {
        var buf;

        buf = [];
        for (var i = 0; i < length; i++) {
            var chr = data.slice(offset + (i - 1), offset + i);
            buf.push(chr);
            length -= utf8Overhead(chr);
        }
        return [buf.length, buf.join('')];
    };
    var _unserialize = function (data, offset) {
        var readdata;
        var readData;
        var chrs = 0;
        var ccount;
        var stringlength;
        var keyandchrs;
        var keys;

        if (!offset) {
            offset = 0;
        }
        var dtype = (data.slice(offset, offset + 1)).toLowerCase();

        var dataoffset = offset + 2;
        var typeconvert = function (x) {
            return x;
        };

        switch (dtype) {
        case 'i':
            typeconvert = function (x) {
                return parseInt(x, 10);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
        case 'b':
            typeconvert = function (x) {
                return parseInt(x, 10) !== 0;
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
        case 'd':
            typeconvert = function (x) {
                return parseFloat(x);
            };
            readData = read_until(data, dataoffset, ';');
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 1;
            break;
        case 'n':
            readdata = null;
            break;
        case 's':
            ccount = read_until(data, dataoffset, ':');
            chrs = ccount[0];
            stringlength = ccount[1];
            dataoffset += chrs + 2;

            readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
            chrs = readData[0];
            readdata = readData[1];
            dataoffset += chrs + 2;
            if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
                error('SyntaxError', 'String length mismatch');
            }

            // Length was calculated on an utf-8 encoded string
            // so wait with decoding
            readdata = that.utf8_decode(readdata);
            break;
        case 'a':
            readdata = {};

            keyandchrs = read_until(data, dataoffset, ':');
            chrs = keyandchrs[0];
            keys = keyandchrs[1];
            dataoffset += chrs + 2;

            for (var i = 0; i < parseInt(keys, 10); i++) {
                var kprops = _unserialize(data, dataoffset);
                var kchrs = kprops[1];
                var key = kprops[2];
                dataoffset += kchrs;

                var vprops = _unserialize(data, dataoffset);
                var vchrs = vprops[1];
                var value = vprops[2];
                dataoffset += vchrs;

                readdata[key] = value;
            }

            dataoffset += 1;
            break;
        default:
            error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
            break;
        }
        return [dtype, dataoffset - offset, typeconvert(readdata)];
    };

    return _unserialize((data + ''), 0)[2];
};

fn.utf8_decode = function (str_data) {
    // Converts a UTF-8 encoded string to ISO-8859-1  
    // 
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/utf8_decode
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +      input by: Aman Gupta
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Norman "zEh" Fuchs
    // +   bugfixed by: hitwork
    // +   bugfixed by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // *     example 1: \php.utf8_decode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'
    var tmp_arr = [],
        i = 0,
        ac = 0,
        c1 = 0,
        c2 = 0,
        c3 = 0;

    str_data += '';

    while (i < str_data.length) {
        c1 = str_data.charCodeAt(i);
        if (c1 < 128) {
            tmp_arr[ac++] = String.fromCharCode(c1);
            i++;
        } else if (c1 > 191 && c1 < 224) {
            c2 = str_data.charCodeAt(i + 1);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = str_data.charCodeAt(i + 1);
            c3 = str_data.charCodeAt(i + 2);
            tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }

    return tmp_arr.join('');
};

fn.utf8_encode = function (argString) {
    // Encodes an ISO-8859-1 string to UTF-8  
    // 
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/utf8_encode
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // *     example 1: \php.utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'
    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = "",
        start, end, stringl = 0;

    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }

    if (end > start) {
        utftext += string.slice(start, stringl);
    }

    return utftext;
};


// export it
return fn;
});