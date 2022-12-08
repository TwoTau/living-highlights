---
title: Living Highlights
author:
  - name: Vishal Devireddy
    email: none
    org: University of Washington
    city: Seattle
    state: Washington
    country: United States
  - name: Tu Nguyen
    email: none
    org: University of Washington
    city: Seattle
    state: Washington
    country: United States
conference: Proceedings of the 7th International Joint Conference on Artificial Intelligence (IJCAI '81)
keywords: 
  - Living papers
  - Social media
theme: distill
section-numbers: false
year: 2022
output:
  html: 
    styles: styles.css
    selfContained: true
---

[:annotation-thread:]{}

~~~ definitions
@h :h: disparity vector
@x :x: position vector in an image
~~~

::: abstract
Image registration finds a variety of applications in computer vision. Unfortunately, traditional image registration techniques tend to be costly. We present a new image registration technique that makes use of the spatial intensity gradient of the images to find a good match using a type of Newton-Raphson iteration. Our technique is faster because it examines far fewer potential matches between the images than existing techniques. Furthermore, this registration technique can be generalized to handle rotation, scaling and shearing. We show show our technique can be adapted for use in a stereo vision system.

:::

# Introduction {#sec1}

Image registration finds a variety of applications in computer vision, such as image matching for stereo vision, pattern recognition, and motion analysis. Unfortunately, existing techniques for image registration tend to be costly. Moreover, they generally fail to deal with rotation or other distortions of the images.

In this paper we present a new image registration technique that uses spatial intensity gradient information to direct the search for the position that yields the best match. By taking more information about the images into account, this technique is able to find the best match between two images with far fewer comparisons of images than techniques which examine the possible positions of registration in some fixed order. Our technique takes advantage of the fact that in many applications the two images are already in approximate registration. This technique can be generalized to deal with arbitrary linear distortions of the image, including rotation. We then describe a stereo vision system that uses this registration technique, and suggest some further avenues for research toward making effective use of this method in stereo image understanding.

# The registration problem {#sec2}

::: figure {#fig1 .margin}
```js
html`<img src="assets/fig1.svg">`;
```
| The image registration problem.
:::

The translational image registration problem can be characterized as follows: We are given functions $F(@x)$ and $G(@x)$ which give the respective pixel values at each location $@x$ in two images, where $@x$ is a vector. We wish to find the disparity vector $@h$ which minimizes some measure of the difference between $F(@x + @h)$ and $G(@x)$, for $@x$ in some region of interest $@R$. (See @fig:fig1).

~~~ definitions
F(@x) :fx: The first stereo image
F(x) :fx: The first stereo image
G(@x) :gx: The second stereo image
G(x) :gx: The second stereo image
F(@x + @h) :fxh: The best translated $F(@x)$ to approximate $G(@x)$
F(x + @h) :fxh: The best translated $F(@x)$ to approximate $G(@x)$
~~~

~~~ definitions
@R :r: Region of interest
~~~

Typical measures of the difference between $F(x + @h)$ and $G(x)$ are:

- $L_1 \, \text{norm} = \sum_{x \varepsilon @R} | F(x + @h) - G(@x) |$

- $L_2 \, \text{norm} = (\sum_{x \varepsilon @R} [ F(x + @h) - G(@x) ]^2)^{\frac{1}{2}}$

- negative of normalized correlation
~~~ math
= \frac{-\sum_{x \varepsilon @R} F(x + @h) G(x)}{(\sum_{x \varepsilon @R})^\frac{1}{2} (\sum_{x \varepsilon @R} G(x) ^2)^ \frac{1}{2}}
~~~

We will propose a more general measure of image difference, of which both the $L_2$ norm and the correlation are special cases. The $L_1$ norm is chiefly of interest as an inexpensive approximation to the $L_2$ norm.

# Existing techniques {#sec3}

An obvious technique for registering two images is to calculate a measure of the difference between the images at all possible values of the disparity vector $@h$—that is, to exhaustively search the space of possible values of $@h$. This technique is very time consuming: if the size of the picture $G(x)$ is $@N \times @N$, and the region of possible values of $@h$ is of size $@M \times @M$, then this method requires $O(@M^2 @N^2)$ time to compute.

~~~ definitions
@N :n: Size of picture $G(x)$
@M :m: Size of the region of possible values of $@h$
~~~

Speedup at the risk of possible failure to find the best $@h$ can be achieved by using a hill-climbing technique. This technique begins with an initial estimate $@h_0$ of the disparity. To obtain the next guess from the current guess $@h_k$, one evaluates the difference function at all points in a small (say, $3 \times 3$) neighborhood of $h_k$ and takes as the next guess $@h_{k+1}$ that point which minimizes the difference function. As with all hill-climbing techniques, this method suffers from the  problem of false peaks: the local optimum that one attains may not be the global optimum. This technique operates in $O(@M^2 @N)$ time on the average, for $@M$ and $@N$ as above.

Another technique, known as the sequential similarity detection algorithm (SSDA) [@Barnea1972], only estimates the error for each disparity vector $@h$. In SSDA, the error function must be a cumulative one such as the $L_1$ or $L_2$ norm. One stops accumulating the error for the current $@h$ under investigation when it becomes apparent that the current $@h$ is not likely to give the best match. Criteria for stopping include a fixed threshold such that when the accumulated error exceeds this threshold one goes on to the next $@h$, and a variable threshold which increases with the number of pixels in $@R$ whose contribution to the total error have been added. SSDA leaves unspecified the order in which the $h$'s are examined.

Note that in SSDA if we adopt as our threshold the minimum error we have found among the $@h$ examined so far, we obtain an algorithm similar to alpha-beta pruning in minmax game trees [@Nilsson1971]. Here we take advantage of the fact that in evaluating $\min_{@h} \sum_x d(x, @h)$, where $d(x, @h)$ is the contribution of pixel $@x$ at disparity $@h$ to the total error, the $\sum_x$ can only increase as we look at more $x$'s (more pixels).

~~~ definitions
d(x, @h) :dxh: contribution of pixel $@x$ at disparity $@h$ to the total error
~~~

Some registration algorithms employ a coarse-fine search strategy. See [@Moravec1979] for an example. One of the techniques discussed above is used to find the best registration for the images at low resolution, and the low resolution match is then used to constrain the region of possible matches examined at higher resolution. The coarse-fine strategy is adopted implicitly by some image understanding systems which work with a "pyramid" of images of the same scene at various resolutions.

It should be nated that some of the techniques mentioned so far can be combined because they concern orthogonal aspects of the image registration problem. Hill climbing and exhaustive search concern only the order in which the algorithm searches for the best match, and SSDA specifies only the method used to calculate (an estimate of) the difference function. Thus for example, one could use the SSDA technique with either hill climbing or exhaustive search, in addition a coarse-fine strategy may be adopted.

The algorithm we present specifies the order in which to search the space of possible $@h$'s. In particular, our technique starts with an initial estimate of $@h$, and it uses the spatial intensity gradient at each point of the image to modify the current estimate of $@h$ to obtain an $@h$ which yields a better match. This process is repeated in a kind of Newton-Raphson iteration. If the iteration converses, it will do so in $O(@M^2 \log @N)$ steps on the average. This registration technique can be combined with a coarse-fine strategy,since is requires an initial estimate of the approximate disparity $h$.

# The registration algorithm {#sec4}

In this section we first derive an intuitive solution to the one dimensional registration problem, and then we derive an alternative solution which we generalize to multiple dimensions. We then show how our technique generalizes to other kinds of registration. We also discuss implementation and performance of the algorithm.

## One dimensional case {#sec4_1}

::: figure {#fig2 .margin sticky-until="#sec4_2"}
```js
html`<img src="assets/fig2.svg">`;
```
| Two curves to be matched.
:::

In the one-dimensional registration problem, we wish to find the horizontal disparity $@h$ between two curves $F(x)$ and $G(x) = F(x + @h)$. This is illustrated in @fig:fig2.

Our solution to this problem depends on $F'(x)$, a linear approximation to the behavior of $F(x)$ in the neighborhood of $@x$, as do all subsequent solutions in this paper. In particular, for small $@h$,

~~~ definitions
F'(x) :fprimex: Linear approximation of $F(x)$ in the neighborhood of $@x$
~~~

~~~ equation {#e1}
\begin{align*}
  F'(x) &\approx \frac{F(x + @h) - F(x)}{@h} \\
  &= \frac{G(x) - F(x)}{@h}
\end{align*}
~~~

so that

~~~ equation {#e2}
@h = \frac{G(x) - F(x)}{F'(x)}
~~~

The success of our algorithm requires $@h$ to be small enough that this approximation is adequate. In section @sec:sec4_3 we will show how to extend the range of $@h$'s over which this approximation is adequate by smoothing the images.

The approximation to $@h$ given in @eqn:e2 depends on $@x$. A natural method for combining the various estimates of $@h$ at various values of $@x$ would be to simply average them:

~~~ equation {#e3}
@h \approx \sum_x \frac{G(x) - F(x)}{F'(x)} / \sum_x 1
~~~

We can improve this average by realizing that the linear approximation in @eqn:e1 is good where $F(x)$ is nearly linear, and conversely is worse where $|F''(x)|$ is large. Thus we could weight the contribution of each term to the average in @eqn:e3 in inverse proportion to an estimate of $|F''(x)|$. One such estimate is

~~~ definitions
F''(x) :fprimeprimex: TODO
G'(x) :gprimex: TODO
~~~

~~~ equation {#e4}
F''(x) \approx \frac{G'(x) - F'(x)}{@h}
~~~

Since our estimate is to be used as a weight in an average, we can drop the constant factor of $\frac{1}{@h}$ in @eqn:e4, and use as our weighting function

~~~ equation {#e5}
@w(x) = \frac{1}{|G'(x) - F(x)|}
~~~

~~~ definitions
@w(x) :wx: weighting function
~~~

This in fact appeals to our intuition: for example, in @fig:fig2, where the two curves cross, the estimate of $@h$ provided by @eqn:e2 is $0$, which is bad; fortunately, the weight given to this estimate in the average is small, since the difference between $F'(x)$ and $G'(x)$ at this point is large. The average with weighting is

~~~ equation {#e6}
@h \approx \sum_x \frac{@w(x)[G(x) - F(x)]}{F'(x)} / \sum_{x} @w(x)
~~~

where $@w(x)$ is given by @eqn:e5.

Having obtained this estimate. we can then move $F(x)$ by our estimate of $@h$, and repeat this procedure, yielding a type of Newton-Raphson iteration. Ideally, our sequence of estimates of $@h$ will converge to the best $@h$. This iteration is expressed by

~~~ math
@h_0 = 0,
~~~

~~~ equation {#e7}
@h_{k+1} = @h_k + \sum_{x} \frac{@w(x)[G(x) - F(x + @h_k)]}{F'(x + @h_k)} / \sum_x @w(x)
~~~

## An alternative derivation {#sec4_2}

The derivation given above does not generalize well to two dimensions because the two-dimensional linear approximation occurs in a different form. Moreover, @eqn:e2 is undefined where $F'(x) = 0$, i.e. where the curve is level. Both of these problems can be corrected by using the linear approximation of equation @eqn:e1 in the form

~~~ equation {#e8}
F(x + @h) \approx F(x) + @hF'(x)
~~~

to find the $h$ which minimizes the $L_2$ norm measure of the difference between the curves:

~~~ math
E = \sum_x [F(x + @h) - G(x)]^2
~~~

To minimize the error with respect to $@h$, we set

~~~ math
\begin{align*}
  0 &= \frac{\partial E}{\partial @h} \\
  &\approx \frac{\partial}{\partial @h} \sum_x [F(x) + @hF'(x) - G(x)]^2 \\
  &= \sum_x 2F'(x)[F(x) + @hF'(x) - G(x)]
\end{align*}
~~~

from which

~~~ equation {#e9}
@h \approx \frac{\sum_x F'(x)[G(x) - F(x)]}{\sum_x F'(x)^2}
~~~

This is essentially the same solution that we derived in @eqn:e6, but with the weighting function $@w(x) = F'(x)^2$. As we will see the form of the linear approximation we have used here generalizes to two or more dimensions. Moreover, we have avoided the problem of dividing by $0$, since in @eqn:e9 we will divide by $0$ only if $F'(x) = 0$ everywhere (in which case $@h$ really is undefined), whereas in @eqn:e3 we will divide by $0$ if $F'(x) = 0$ anywhere.

The iterative form with weighting corresponding to @eqn:e7 is

~~~ math
@h_0 = 0,
~~~

~~~ equation {#e10}
@h_{k+1} = @h_k + \frac{\sum_x @w(x) F'(x + @h_k) [G(x) - F(x + @h_k)]}{\sum_x @w(x) F'(x + @h_k)^2}
~~~

where $@w(x)$ is given by @eqn:e5.

## Performance {#sec4_3}

A natural question to ask is under what conditions and how fast the sequence of $h_k$'s converges to the real $h$. Consider the case:

$F(x) = \sin{x}$,

$G(x) = F(x + @h) = \sin{(x + @h)}$.

It can be shown that both versions of the registration algorithm given above will converge to the correct $@h$ for $|@h| < \pi$, that is, for initial misregistrations as large as one-half wavelength. This suggests that we can improve the range of convergence of the algorithm by suppressing high spatial frequencies in the image, which can be accomplished by smoothing the image, i.e. by replacing each pixel of the image by a weighted average of neighboring pixels. The tradeoff is that smoothing suppresses small details, and thus makes the match less accurate. If the smoothing window is much larger than the size of the object that we are trying to match, the object may be suppressed entirely, and so no match will be possible.

Since lowpass filtered images can be sampled at lower resolution with no loss of information, the above observation suggests that we adopt a coarse-fine strategy. We can use a low resolution smoothed version of the image to obtain an approximate match. Applying the algorithm to higher resolution images will refine the match obtained at lower resolution.

While the effect of smoothing is to extend the range of convergence, the weighting function serves to improve the accuracy of the approximation, and thus to speed up the convergence. Without weighting, i.e. with $@w(x) = 1$, the calculated disparity $@h_1$ of the first iteration of @eqn:e10 with $F(x) = \sin{x}$ falls off to zero as the disparity approaches one-half wavelength. However, with $@w(x)$ as in @eqn:e5, the calculation of disparity is much more accurate, and only falls off to zero at a disparity very near one-half wavelength. Thus with $@w(x)$ as in @eqn:e5 convergence is faster for large disparities.

## Implementation {#sec4_4}

Implementing @eqn:e10 requires calculating the weighted sums of the quantities $F'G$, $F'F$, and $(F')^2$ over the region of interest $@R$. We cannot calculate $F'(x)$ exactly, but for the purposes of this algorithm, we can estimate it by

~~~ math
F'(x) \approx \frac{F(x + \Delta x) - F(x)}{\Delta x}
~~~

and similarly for $G'(x)$, where we choose $\Delta x$ appropriately small (e.g. one pixel). Some more sophisticated technique could be used for estimating the first derivatives, but in general such techniques are equivalent to first smoothing the function, which we have proposed doing for other reasons, and then taking the difference.

## Generalization to multiple dimensions {#sec4_5}

The one-dimensional registration algorithm given above can be generalized to two or more dimensions. We wish to minimize the $L_2$ norm measure of error:

~~~ math
E = \sum_{x \varepsilon @R} [F(x + @h) - G(x)]^2
~~~

where $@x$ and $@h$ are $n$-dimensional row vectors. We make a linear approximation analogous to that in @eqn:e8,

~~~ math
F(x + @h) \approx F(x) + @h \frac{\partial}{\partial x} F(x)
~~~

where $\partial / \partial x$ is the gradient operator with respect to $x$, as a column vector:

~~~ math
\frac{\partial}{\partial x} = \left[ \frac{\partial}{\partial x_1} \frac{\partial}{\partial x_2} \dots \frac{\partial}{\partial x_n} \right]^\top
~~~

Using this approximation, to minimize $E$, we set

~~~ math
\begin{align*}
  0 &= \frac{\partial}{\partial @h} E \\
  &\approx \frac{\partial}{\partial @h} \sum_x \left[ F(x) + @h \frac{\partial F}{\partial x} - G(x) \right]^2 \\
  &= \sum_x 2 \frac{\partial F}{\partial x} \left[ F(@x) + @h \frac{\partial F}{\partial x} - G(x) \right]
\end{align*}
~~~

from which

~~~ math
@h = \left[ \sum_x \left( \frac{\partial F}{\partial x} \right)^\top [G(x) - F(x)] \right] \left[ \sum_x \left( \frac{\partial F}{\partial x} \right)^\top \frac{\partial F}{\partial x} \right]^{-1}
~~~

which has much the same form as the one-dimensional version in @eqn:e9.

The discussions above of iteration, weighting, smoothing, and the coarse-fine technique with respect to the onedimensional case apply to the n-dimensional case as well. Calculating our estimate of $@h$ in the two-dimensional case requires accumulating the weighted sum of five products $((G - F)F_x, (G - F)F_y, F^2_x, F^2_y, \text{and } F_xF_y)$ over the region $@R$, as opposed to accumulating one product for correlation or the $L_2$ norm. However, this is more than compensated for, especially in high-resolution images, by evaluating these sums at fewer values of $@h$.

## Further generalizations {#sec4.6}
Our technique can be extended to registration between two images related not by a simple translation, but by an arbitrary linear transformation, such as rotation, scaling, and shearing. Such a relationship is expressed by

~~~ math
G(x) = F(x@A + @h)
~~~

where $@A$ is a matrix expressing the linear spatial tranformation between $F(x)$ and $G(x)$. The quantity to be minimized in this case is

~~~ definitions
@A :a: matrix representing linear transformation between $F(x)$ and $G(x)$
~~~

~~~ math
E = \sum_x [F(x@A + @h) - G(x)]^2
~~~

To determine the amount $\Delta @A$ to adjust $@A$ and the amount $\Delta @h$ to adjust $@h$, we use the linear approximation

~~~ equation {#e11}
\begin{align*}
  & F(x(@A + \Delta @A) + (@h + \Delta @h)) \\
  \approx& F(x@A + @h) + (x \Delta @A + \Delta @h) \frac{\partial}{\partial x} F(x)
\end{align*}
~~~

When we use this approximation the error expression again becomes quadratic in the quantities to be minimized with respect to. Differentiating with respect to these quantities and setting the results equal to zero yields a set of linear equations to be solved simultaneously.

This generalization is useful in applications such as stereovision, where the two different views of the object will be different views, due to the difference of the viewpoints of the cameras or to differences in the processing of the two images. If we model this difference as a linear transformation, we have (ignoring the registration problem for the moment)

~~~ math
F(x) = @\alpha G(x) + @\beta
~~~

where $@\alpha$ may be thought of as a contrast adjustment and $@\beta$ as a brightness adjustment. Combining this with the general linear transformation registration problem, we obtain

~~~ definitions
@\alpha :alpha: contrast adjustment
@\beta :beta: brightness adjustment
~~~

~~~ math
E = \sum_x [F(x@A + @h) - (@\alpha G(x) + @\beta)]^2
~~~

as the quantity to minimize with respect to $@\alpha$, $@\beta$, $@A$, and $@h$. The minimization of this quantity, using the linear approximation in equation @eqn:e11, is straightforward. This is the general form promised in section @sec:sec2. If we ignore $@A$, minimizing this quantity is equivalent to maximizing the correlation coefficient (see, for example, [@Dudewicz1976]); if we ignore $@\alpha$ and $@\beta$ as well, minimizing this form is equivalent to minimizing the $L_2$ norm.

# Application to stereo vision {#sec5}

In this section we show how the generalized registration algorithm described above can be applied to extracting depth information from stereo images.

~~~ bibliography
@article{Barnea1972,
  title={A Class of Algorithms for Fast Digital Image Registration},
  author={Daniel I. Barnea and Harvey F. Silverman},
  journal={IEEE Transactions on Computers},
  year={1972},
  volume={C-21},
  pages={179-186},
  doi={10.1109/TC.1972.5008923}
}

@article{Marr1979,
  title={A computational theory of human stereo vision},
  author={D. Marr and Tomaso A. Poggio},
  journal={Proceedings of the Royal Society of London. Series B, Biological sciences},
  year={1979},
  volume={204 1156},
  pages={301-328},
  doi={10.1016/B978-1-4832-1446-7.50046-7}
}

@book{Dudewicz1976,
  place={New York},
  title={Introduction to statistics and probability},
  publisher={Holt, Rinehart and Winston},
  author={Dudewicz, Edward J.},
  year={1976}
}

@inproceedings{Baker1980,
  title={Edge Based Stereo Correlation},
  author={Baker, H. Harlyn},
  year={1980},
  booktitle={DARPA Image Understanding Workshop},
  pages={168-175}
}

@inproceedings{Gennery1979,
  title={Stereo-Camera Calibration},
  author={Gennery, Donald B},
  year={1979},
  booktitle={DARPA Image Understanding Workshop},
  pages={101-107}
}

@inproceedings{Moravec1979,
  title={Visual Mapping by a Robot Rover},
  author={Hans P. Moravec},
  booktitle={IJCAI},
  year={1979},
  doi={10.5555/1624861.1624997}
}

@inproceedings{Nilsson1971,
  title={Problem-solving methods in artificial intelligence},
  author={Nils J. Nilsson},
  booktitle={McGraw-Hill computer science series},
  year={1971},
  doi={10.1145/1056578.1056583}
}
~~~
