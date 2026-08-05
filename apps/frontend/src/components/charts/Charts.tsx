'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import Card from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import styles from './Charts.module.css'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface TimeSeriesData {
  date: string
  value: number
  category?: string
}

interface PieData {
  name: string
  value: number
  color: string
}

// Occupancy Rate Chart (Bar Chart)
export function OccupancyRateChart({ data }: { data: ChartData[] }) {
  const chartRef = useRef<SVGSVGElement>(null)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const svg = d3.select(chartRef.current)
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Clear previous chart
    svg.selectAll('*').remove()

    // Create scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height, 0])

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3B82F6')
      .attr('stop-opacity', 1)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1D4ED8')
      .attr('stop-opacity', 1)

    // Add bars with animation
    const bars = g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#bar-gradient)')
      .attr('rx', 4)
      .style('cursor', 'pointer')

    // Animate bars
    bars.transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value))
      .ease(d3.easeCubicOut)

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        setHoveredBar(d.label)
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', '#2563EB')
          .attr('transform', `translate(0, -2)`)
      })
      .on('mouseout', function() {
        setHoveredBar(null)
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', 'url(#bar-gradient)')
          .attr('transform', 'translate(0, 0)')
      })

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px')

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px')

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)

  }, [data])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Rate by Hostel</h3>
      <div className="flex justify-center">
        <svg ref={chartRef} width="600" height="400"></svg>
      </div>
      {hoveredBar && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {hoveredBar}: {data.find(d => d.label === hoveredBar)?.value}%
          </p>
        </div>
      )}
    </Card>
  )
}

// Payment Trend Chart (Line Chart)
export function PaymentTrendChart({ data }: { data: TimeSeriesData[] }) {
  const chartRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: TimeSeriesData } | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const svg = d3.select(chartRef.current)
    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom

    // Clear previous chart
    svg.selectAll('*').remove()

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([height, 0])

    // Create line generator
    const line = d3.line<TimeSeriesData>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX)

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create gradient for area
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%')

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.3)

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.05)

    // Create area
    const area = d3.area<TimeSeriesData>()
      .x(d => x(new Date(d.date)))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX)

    // Add area with animation
    g.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', area)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0)
      .transition()
      .duration(1500)
      .attr('opacity', 1)

    // Add line with animation
    const path = g.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 3)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')

    // Animate line drawing
    const pathLength = path.node()?.getTotalLength() || 0
    path
      .attr('stroke-dasharray', pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)

    // Add dots
    const dots = g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .attr('fill', '#10B981')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')

    // Animate dots
    dots.transition()
      .duration(1000)
      .delay((d, i) => 2000 + i * 100)
      .attr('r', 5)

    // Add hover effects
    dots
      .on('mouseover', function(event, d) {
        const [x, y] = d3.pointer(event, g)
        setTooltip({ x: x + margin.left, y: y + margin.top, data: d })
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
      })
      .on('mouseout', function() {
        setTooltip(null)
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)
      })

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b %Y') as any))
      .selectAll('text')
      .style('font-size', '12px')

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `GHS ${d}`))
      .selectAll('text')
      .style('font-size', '12px')

  }, [data])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Trends</h3>
      <div className="flex justify-center">
        <svg ref={chartRef} width="600" height="400"></svg>
      </div>
      {tooltip && (
        <div
          className="absolute bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none z-10"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="text-sm font-medium">{new Date(tooltip.data.date).toLocaleDateString()}</p>
          <p className="text-sm">GHS {tooltip.data.value.toLocaleString()}</p>
        </div>
      )}
    </Card>
  )
}

// Student Demographics Chart (Pie Chart)
export function DemographicsChart({ data }: { data: PieData[] }) {
  const chartRef = useRef<SVGSVGElement>(null)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const svg = d3.select(chartRef.current)
    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2 - 20

    // Clear previous chart
    svg.selectAll('*').remove()

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`)

    // Create pie generator
    const pie = d3.pie<PieData>()
      .value(d => d.value)
      .sort((a, b) => d3.descending(a.value, b.value))

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius)

    const arcHover = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius + 10)

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer')

    // Add paths with animation
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('transform', 'scale(0)')
      .style('transform-origin', 'center')
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .ease(d3.easeElasticOut)
      .attr('transform', 'scale(1)')

    // Add hover effects
    arcs
      .on('mouseover', function(event, d) {
        setSelectedSegment(d.data.name)
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', (d: any) => arcHover(d))
      })
      .on('mouseout', function() {
        setSelectedSegment(null)
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', (d: any) => arc(d))
      })

    // Add labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d as any)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .style('opacity', 0)
      .text(d => `${Math.round((d.data.value / data.reduce((sum, item) => sum + item.value, 0)) * 100)}%`)
      .transition()
      .duration(800)
      .delay((d, i) => 800 + i * 100)
      .style('opacity', 1)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, 20)`)

    const legendItems = legend.selectAll('.legend-item')
      .data(data)
      .enter().append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`)

    legendItems.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => d.color)
      .attr('rx', 2)

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .attr('font-size', '12px')
      .attr('fill', '#4B5563')
      .text(d => d.name)

  }, [data])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Demographics</h3>
      <div className="flex justify-center">
        <svg ref={chartRef} width="400" height="400"></svg>
      </div>
      {selectedSegment && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {selectedSegment}: {data.find(d => d.name === selectedSegment)?.value} students
          </p>
        </div>
      )}
    </Card>
  )
}

// Room Allocation Chart (Donut Chart)
export function RoomAllocationChart({ data }: { data: PieData[] }) {
  const chartRef = useRef<SVGSVGElement>(null)
  const [centerText, setCenterText] = useState('Total')

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    const svg = d3.select(chartRef.current)
    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2 - 20
    const innerRadius = radius * 0.6

    // Clear previous chart
    svg.selectAll('*').remove()

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width/2},${height/2})`)

    // Create donut generator
    const donut = d3.pie<PieData>()
      .value(d => d.value)
      .sort((a, b) => d3.descending(a.value, b.value))

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)

    const arcHover = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10)

    // Create arcs
    const arcs = g.selectAll('.arc')
      .data(donut(data))
      .enter().append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer')

    // Add paths with animation
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .ease(d3.easeCubicOut)
      .style('opacity', 1)

    // Add hover effects
    arcs
      .on('mouseover', function(event, d) {
        setCenterText(d.data.name)
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', (d: any) => arcHover(d))
      })
      .on('mouseout', function() {
        setCenterText('Total')
        d3.select(this)
          .select('path')
          .transition()
          .duration(200)
          .attr('d', (d: any) => arc(d))
      })

    // Add center text
    const centerGroup = g.append('g')
      .attr('text-anchor', 'middle')

    centerGroup.append('text')
      .attr('class', 'center-label')
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1F2937')
      .text(data.reduce((sum, item) => sum + item.value, 0))

    centerGroup.append('text')
      .attr('class', 'center-sublabel')
      .attr('y', 25)
      .attr('font-size', '14px')
      .attr('fill', '#6B7280')
      .text(centerText)

  }, [data, centerText])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Allocation</h3>
      <div className="flex justify-center">
        <svg ref={chartRef} width="400" height="400"></svg>
      </div>
    </Card>
  )
}

// Combined Chart Component
export function DashboardCharts() {
  const [chartData, setChartData] = useState({
    occupancy: [
      { label: 'Hostel A', value: 85 },
      { label: 'Hostel B', value: 92 },
      { label: 'Hostel C', value: 78 },
      { label: 'Hostel D', value: 88 }
    ],
    payments: [
      { date: '2024-01-01', value: 45000 },
      { date: '2024-02-01', value: 52000 },
      { date: '2024-03-01', value: 48000 },
      { date: '2024-04-01', value: 61000 },
      { date: '2024-05-01', value: 58000 },
      { date: '2024-06-01', value: 67000 }
    ],
    demographics: [
      { name: 'Year 1', value: 120, color: '#3B82F6' },
      { name: 'Year 2', value: 95, color: '#10B981' },
      { name: 'Year 3', value: 80, color: '#F59E0B' },
      { name: 'Year 4', value: 65, color: '#EF4444' }
    ],
    allocation: [
      { name: 'Allocated', value: 280, color: '#10B981' },
      { name: 'Available', value: 45, color: '#6B7280' },
      { name: 'Maintenance', value: 15, color: '#F59E0B' }
    ]
  })

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OccupancyRateChart data={chartData.occupancy} />
        <PaymentTrendChart data={chartData.payments} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DemographicsChart data={chartData.demographics} />
        <RoomAllocationChart data={chartData.allocation} />
      </div>
    </div>
  )
}
