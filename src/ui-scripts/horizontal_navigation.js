﻿/**
 * @constructor
 * @extends UIBase
 */
var HorizontalNavigation = function(cell)
{
  this.type = 'horizontal-navigation';

  var element = null;
  var lastDir = null;

  this.setContent = function(template_list, focus_end)
  {
    this.breadcrumbs.clearAndRender(template_list);
    if (focus_end)
    {
        //
    }
  };

  this.nav = function(dir)
  {
      var left = 0;
      var breadcrumbsDim = this.breadcrumbs.getBoundingClientRect();
debugger
      if (lastDir != dir) element = null;
      lastDir = dir;

      if (dir == "back")
      {
          element = element || document.elementFromPoint(this.nav_back.getBoundingClientRect().right + 1, breadcrumbsDim.top);
          var leftEdge = element.getBoundingClientRect().left;
          left = this.nav_back.getBoundingClientRect().right - leftEdge;
          element = element.previousElementSibling;
      }
      else
      {
          element = element || document.elementFromPoint(this.nav_forward.getBoundingClientRect().left - 1, breadcrumbsDim.top);
          var rightEdge = element.getBoundingClientRect().right - breadcrumbsDim.left; //element.offsetLeft + element.offsetWidth;
          left = breadcrumbsDim.width - rightEdge;
          element = element.nextElementSibling;
      }
      var pos = parseInt(getComputedStyle(breadcrumbs, null).getPropertyValue("left"));
      this.breadcrumbs.style.OTransitionDuration = Math.min(Math.abs(left) / 200, .2) + "s";
      this.breadcrumbs.style.left = pos + left + "px";
  };

  this.checkWidth = function()
  {
      element = null;
      if (this.breadcrumbs.scrollWidth > this.breadcrumbs.offsetWidth)
      {
          this.element.className = "navs";
      }
      else
      {
          this.element.className = "";
          this.breadcrumbs.style.removeProperty("left");
      }
  };

  this.init = function(cell)
  {
    this.cell = cell;
    this.initBase();

    this.element = document.getElementById(this.type + '-to-' + this.cell.id) || this.update();
    this.breadcrumbs = document.createElement("breadcrumbs");
    this.nav_back = document.createElement("nav");
    this.nav_back.textContent = "◀";
    this.nav_back.setAttribute("dir", "back");
    this.nav_back.setAttribute("handler", "horizontal-nav");
    this.nav_forward = document.createElement("nav");
    this.nav_forward.setAttribute("dir", "forward");
    this.nav_forward.setAttribute("handler", "horizontal-nav");
    this.nav_forward.textContent = "▶";
    this.element.appendChild(this.nav_back);
    this.element.appendChild(this.breadcrumbs);
    this.element.appendChild(this.nav_forward);
  };

  this.init(cell);
};

HorizontalNavigation.prototype = UIBase;

